const PaymentPageRepository = require('../repositories/payment-page');

module.exports = (configs, environment) => async (clientId, reference) => {

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        throw new Error('Reference is required and must be a String');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentPage = await PaymentPageRepository.findOneWithClient(database, clientId, reference);

    if (!paymentPage) {
        throw new Error('Invalid reference for Payment Page');
    }

    return { details: paymentPage.get() }
}