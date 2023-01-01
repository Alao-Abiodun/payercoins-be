const PaymentPageRepository = require('../repositories/payment-page');

module.exports = (configs, environment) => async (clientId) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentPages = await PaymentPageRepository.findAllWithClient(database, clientId);

    return { details: paymentPages.map(paymentPage => paymentPage.get()) }
}