const PaymentLinkRepository = require('../repositories/payment-link');
const paymentLinkTransactionRepository = require('../repositories/payment-link-transaction');
const TransactionRepository = require('../repositories/transaction');
const cryptoRepository = require('../repositories/crypto');

module.exports = (configs, environment) => async (req, res, next) => {

    // get reference from request params
    const reference = req.params.reference;

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        return res.status(422).json({ success: false, message: 'Reference is required and must be a string' });
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get the payment link
    const oldPaymentLinkData = await PaymentLinkRepository.findOneWithPaymentLinkTransactionWithoutClient(database, reference);

    // if payment link is not found
    if (!oldPaymentLinkData) {
        return res.status(404).json({ success: false, message: 'Payment invoice is not found' });
    }

    const oldPaymentLink = oldPaymentLinkData.get();

    // check if payment link is already cancelled
    if (oldPaymentLink.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Payment invoice has been cancelled' });
    }

    // check if payment link is already successful
    if (oldPaymentLink.status === 'successful') {
        return res.status(400).json({ success: false, message: 'Payment invoiced has been paid successful' });
    }

    //get payment link transaction
    const paymentLinkTransactionResponse = await paymentLinkTransactionRepository.
        findPaymentLinkTransactionByPaymentLinkId(database, oldPaymentLink.id);

    if (!paymentLinkTransactionResponse) {
        return;
    }

    const paymentLinkTransaction = paymentLinkTransactionResponse.get();

    // update the payment link
    const updatedPaymentLinkData = await PaymentLinkRepository.updateWithId(database, oldPaymentLink.id, {
        status: 'cancelled',
    });
    // update payment link transaction
    await paymentLinkTransactionRepository.updateWithId(database, paymentLinkTransaction.id, {
        status: 'cancelled'
    });
    // update transaction
    await TransactionRepository.updateWithId(database, paymentLinkTransaction.transactionId, {
        status: 'cancelled',
    });

    return res.status(200).json({ success: true, message: 'Payment invoice has been cancelled successfully'});
}