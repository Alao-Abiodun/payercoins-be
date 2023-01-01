const PaymentPageRepository = require('../repositories/payment-page');
const PaymentPageTransactionRepository = require('../repositories/payment-page-transaction');

module.exports = (configs, environment) => async (reference) => {

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        throw new Error('Reference is required and must be a String');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentPage = await PaymentPageRepository.findOne(database, reference);

    if (!paymentPage) {
        throw new Error('Invalid reference for Payment Page');
    }

    const paymentPageTransaction = await PaymentPageTransactionRepository.findAllWithPaymentPageId(database, paymentPage.id);

    return { details: paymentPageTransaction.map(p => p.get()) }
}