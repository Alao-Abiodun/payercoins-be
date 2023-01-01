const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const PaymentPageRepository = require('../repositories/payment-page');
const helper = require('../helpers');

module.exports = (configs, environment) => async (clientId, reference) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    if (!reference) {
        throw new Error('reference is required');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentPageData = await PaymentPageRepository.findOneWithClient(database, clientId, reference);

    if (!paymentPageData) {
        throw new Error('Invalid reference for Payment Page');
    }

    const paymentPage = paymentPageData.get()

    const updatePaymentPage = await PaymentPageRepository.updateWithId(database, paymentPage.id, { status: 'inactive' });

    return { paymentPage: updatePaymentPage }
}