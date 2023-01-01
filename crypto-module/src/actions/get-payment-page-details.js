const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const PaymentPageRepository = require('../repositories/payment-page');
const PaymentPageTransactionRepository = require('../repositories/payment-page-transaction');
const helper = require('../helpers');

module.exports = (configs, environment) => async (req, res, next) => {

    // get reference from request params
    const reference = req.params.reference;
    const identifier = req.params.identifier;

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        throw new Error('Reference is required and must be a String');
    }

    // validate reference is present and is a String
    if (!identifier || typeof identifier !== 'string') {
        throw new Error('Identifier is required and must be a String');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentPageData = await PaymentPageRepository.findOneWithWithoutReference(database, reference);

    // if payment link is not found
    if (!paymentPageData) {
        return res.status(404).json({ message: 'payment link not found' });
    }

    const paymentPage = paymentPageData.get();

    const paymentPageTransactionData = await PaymentPageTransactionRepository.findOnePaymentPageTransactionWithoutClient(database, identifier);

    if (!paymentPageTransactionData) {
        return res.status(404).json({ message: 'payment not found' });
    }

    const paymentPageTransaction = paymentPageTransactionData.get();

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // find crypto in payment page
    const crypto = cryptos.find(crypto => crypto.id === paymentPageTransaction.address.cryptoId);

    const data = {
        crypto: crypto,
        address: paymentPageTransaction.address.address,
        memo: null,
        reference: paymentPageTransaction.reference,
        amount: {
            amountInCrypto: paymentPageTransaction.amountInCrypto,
            amountInUsd: paymentPageTransaction.amountInUsd,
            currency: { sign: '$', symbol: 'USD', name: 'US Dollar' }
        },
        info: paymentPageTransaction.metaData,
        metaData: paymentPage.metaData
    }

    return res.status(200).json({ message: 'payment page details received', details: data });
}