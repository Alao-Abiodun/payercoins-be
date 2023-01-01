const PaymentLinkRepository = require('../repositories/payment-link');

module.exports = (configs, environment) => async (reference) => {

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        throw new Error('Reference is required and must be a String');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentLink = await PaymentLinkRepository.findOne(database, reference);

    if (!paymentLink) {
        throw new Error('Invalid reference for Payment Link');
    }

    return { details: paymentLink.get() }
}