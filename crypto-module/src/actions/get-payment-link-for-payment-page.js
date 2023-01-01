const paymentLinkRepository = require('../repositories/payment-link');
const cryptoRepository = require('../repositories/crypto');
const userHelper = require('../../../controllers/users/helper')

module.exports = (configs, environment) => async (req, res, next) => {

    try {

    // get reference from request params
    const reference = req.params.reference;

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        return res.status(422).json({ success: false, message: 'Payment reference is required and must be a string' });
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get the payment link
    const paymentLinkData = await paymentLinkRepository.findOneWithPaymentLinkTransactionWithoutClient(database, reference);
    // console.log(paymentLinkData)
    // if payment link is not found
    if (!paymentLinkData) {
        return res.status(404).json({ success: false, message: 'Payment link not found' });
    }

    const paymentLink = paymentLinkData.get();

    // check if payment link is already cancelled
    if (paymentLink.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Payment link has been cancelled' });
    }

    //check if payment link has expired
    let date1 = new Date(paymentLink.expiresAt);
    let date2 = new Date();
    let hourDiff = (date1 - date2) / 36e5;
    // console.log(date1, ' ==== ', date2, ' ----- ', hourDiff)
    if(hourDiff < 0) {
        //console.log('Payment Link Expiry')
        return res.status(400).json({ success: false, message: 'Payment link has expired' });
    }

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // filter the cryptos by the ones that are in the available payment link types
    const cryptosToCreateWalletFor = cryptos.filter(crypto => paymentLink.availableCrypto.includes(crypto.slug));

    const amountDetails = {
        amount: paymentLink.amount,
        amountType: paymentLink.amountType,
        currency: { sign: '$', symbol: 'USD', name: 'US Dollar' }
    };

    // if email, name are present in the metaData return them in the info
    const info = paymentLink.metaData.email && paymentLink.metaData.name ? { name: paymentLink.metaData.name, email: paymentLink.metaData.email } : {};

    const linkData = { page: paymentLink.metaData.page, description: paymentLink.metaData.description };

    amountDetails.confirmedAmountInUsd = paymentLink.paymentLinkTransaction?.confirmedAmountInUsd ?? 0;
    amountDetails.confirmedAmountInCrypto = paymentLink.paymentLinkTransaction?.confirmedAmountInCrypto ?? 0;
    if(paymentLink.paymentLinkTransaction) {
        amountDetails.amountRemainingInUsd = paymentLink.paymentLinkTransaction.amountInUsd - amountDetails.confirmedAmountInUsd;
        amountDetails.amountRemainingInCrypto = paymentLink.paymentLinkTransaction.amountInCrypto - amountDetails.confirmedAmountInCrypto;
    }

    // get user fee percent and fee preference
    const userFee = await userHelper.getUserTransactionFeePrefereenceByUuid(paymentLink.clientId);

    const fee = userFee.preference === 'user' ? ((paymentLink.amount/100) * userFee.fee) : 0;

    const data =
    {
        amountDetails: amountDetails,
        availableCrypto: cryptosToCreateWalletFor,
        transactions: paymentLink.paymentLinkTransaction,
        linkData: linkData,
        info: info,
        status: paymentLink.status,
        expiresAt: paymentLink.expiresAt,
        fee: fee
    };

    return res.status(200).json({ success: true, message: 'payment link details received', details: data });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: 'We are unable to retrieve payment details, please try again.' });
    }
}