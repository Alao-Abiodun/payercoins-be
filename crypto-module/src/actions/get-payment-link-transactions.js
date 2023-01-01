const PaymentLinkRepository = require('../repositories/payment-link');

module.exports = (configs, environment) => async (clientId) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentLinks = await PaymentLinkRepository.findAllWithPaymentLinkTransaction(database, clientId);

    return { details: paymentLinks.map(paymentLink => paymentLink.get()) }
}