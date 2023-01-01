const SDKPaymentLink = require('../../models/sdkPaymentLinkModel'),
    AppError = require("../../utils/libs/appError"),
    catchAsync = require("../../utils/libs/catchAsync"),
    { successResMsg } = require("../../utils/libs/response"),
    randomKey = require('../../utils/libs/gen-key'),
    LiveBox = require("../../crypto-module")("live"),
    SandBox = require("../../crypto-module")("sandbox");

const createPaymentLink = catchAsync(async(req, res, next) => {
    try {
        const { amount, payment_type, customer_name, customer_email, description, redirect_url } = req.body;
        
        if(!amount || !payment_type || !customer_name || !customer_email) {
            return res.status(401).json({
                status: 'failed',
                message: 'Invalid parameter is provided'
            });
        }

        // validate amount_type is either 'fixed' or 'custom'
        let amount_type = 'fixed'; // override amount_type to 'fixed'
        // if (!amount_type || !['fixed', 'custom'].includes(amount_type)) {
        //     amount_type = 'fixed';
        // }

        // validate payment_type param to be either 'donation', 'checkout' or 'api'
        if (!['donation', 'checkout', 'api'].includes(payment_type)) {
            return res.status(401).json({
                status: 'failed',
                message: 'Payment type must be either "donation", "checkout" or "api"'
            });
        }

        // validate currency is an array of string
        let currency = req.body.currency;
        if (!Array.isArray(currency) || currency.length === 0) {
            currency = req.wallets;
        }

        // validate invoice id or generate a new one
        let invoice_id = req.body.invoice_id;
        if(invoice_id && invoice_id.length > 7) {
            let invoice = await SDKPaymentLink.findOne({ invoice_id });
            if(invoice) {
                return res.status(401).json({
                    status: 'failed',
                    message: 'Invoice id already exists'
                });
            }
        } else {
            invoice_id = randomKey(12);
        }

        let callback_url = req.body.callback_url;
        if(!callback_url) {
            if(typeof req.callback_url === 'object') {
                if(req.environment === 'sandbox') {
                        callback_url = req.callback_url.test;
                } else {
                    callback_url = req.callback_url.live;
                }
            }
        }

        if(!callback_url) { // callback is not set yet
            return res.status(401).json({
                status: 'failed',
                message: 'Callback url is required, you need to either pass it a parameter or set it in your dashboard'
            });
        }
        
        const { link, details } = await req.cryptoBox.generatePaymentLink( 
            req.user.uuid, 
            currency, 
            amount, 
            amount_type, 
            parseInt(process.env.PAYMENT_LINK_TIMEOUT), //minutes
            payment_type, 
            { email: customer_email, description: description ?? '', name: customer_name, invoiceId: invoice_id, callbackUrl: callback_url },
        );

        const newPaymentLink = await SDKPaymentLink.create({
            user: req.user._id,
            invoice_id: invoice_id,
            redirect_url: redirect_url ?? '',
            callback_url: callback_url,
            amount: amount,
            reference: details.reference,
            environment: req.environment,
            payment_link_endpoint: link
        });

        return successResMsg(res, 200, {
            message: "Payment link has been created successfully",
            invoice_id: newPaymentLink.invoice_id,
            payment_url: process.env.PAYMENT_LINK_URL + '/?invoice_id=' + newPaymentLink.invoice_id
        });
    } catch(err) {
        console.log(err);
        return res.status(401).json({
            status: 'failed',
            message: 'We could not initiate your payment at the moment, please try again later'
        });
    }
});

const paymentLinkDetails = catchAsync(async(req, res, next) => {
    try {
        const { invoice_id } = req.query;
        const paymentLink = await SDKPaymentLink.findOne({ invoice_id });
        if(!paymentLink) {
            return next(new AppError('Invoice not found', 404));
        }
        if(paymentLink.environment === 'sandbox') {
            const { details } = await SandBox.getPaymentLink(paymentLink.reference);
            return successResMsg(res, 200, {
                message: "Payment link details has been retrieved successfully",
                payment_link_endpoint: paymentLink.payment_link_endpoint,
                payment_details: details,
                environment: paymentLink.environment,
                redirect_url: paymentLink.redirect_url
            });
        } else {
            const { details } = await LiveBox.getPaymentLink(paymentLink.reference);
            return successResMsg(res, 200, {
                message: "Payment link details has been retrieved successfully",
                payment_link_endpoint: paymentLink.payment_link_endpoint,
                payment_details: details,
                environment: paymentLink.environment,
                redirect_url: paymentLink.redirect_url
            });
        }
    } catch(err) {
        console.log(err);
        return next(new AppError('Error fetching payment details, please try again later', 400));
    }
});

const verifyPayment = catchAsync(async(req, res, next) => {
    try {
        const { invoice_id } = req.query;
        const paymentLink = await SDKPaymentLink.findOne({ invoice_id });
        if(!paymentLink) {
            return next(new AppError('Invoice not found', 404));
        }
        if(paymentLink.environment === 'sandbox') {
            const { details } = await SandBox.getPaymentLink(paymentLink.reference);
            return successResMsg(res, 200, {
                status: details.status
            });
        } else {
            const { details } = await LiveBox.getPaymentLink(paymentLink.reference);
            return successResMsg(res, 200, {
                status: details.status
            });
        }
    } catch(err) {
        console.log(err);
        return next(new AppError(err, 400));
    }
});

module.exports = {
    createPaymentLink,
    paymentLinkDetails,
    verifyPayment
}