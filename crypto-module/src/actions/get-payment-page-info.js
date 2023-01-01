const cryptoRepository = require('../repositories/crypto');
const PaymentPageRepository = require('../repositories/payment-page');
const userHelper = require('../../../controllers/users/helper')

module.exports = (configs, environment) => async (req, res, next) => {

    // get reference from request params
    const reference = req.params.reference;

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        throw new Error('Reference is required and must be a String');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentPageData = await PaymentPageRepository.findOne(database, reference);

    // if payment link is not found
    if (!paymentPageData) {
        return res.status(404).json({ message: 'payment link not found' });
    }

    const paymentPage = paymentPageData.get();

    // check if payment link is already cancelled
    if (paymentPage.status !== 'active') {
        return res.status(400).json({ message: 'payment page is not active' });
    }

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // filter the cryptos by the ones that are in the available payment link types
    const cryptosToCreateWalletFor = cryptos.filter(crypto => paymentPage.availableCrypto.includes(crypto.slug));

    // get user fee percent and fee preference
    const userFee = await userHelper.getUserTransactionFeePrefereenceByUuid(paymentPage.clientId);

    const fee = userFee.preference === 'user' ? ((paymentPage.amount/100) * userFee.fee) : 0;

    const data = paymentPage.amountType === 'fixed' ?
        {
            name: paymentPage.metaData.name,
            description: paymentPage.metaData.description,
            type: paymentPage.amountType,
            amount: paymentPage.amount + fee,
            currency: { sign: '$', symbol: 'USD', name: 'US Dollar' },
            availableCrypto: cryptosToCreateWalletFor,
            fee: fee
        } :
        {
            name: paymentPage.metaData.name,
            description: paymentPage.metaData.description,
            type: paymentPage.amountType,
            currency: { sign: '$', symbol: 'USD', name: 'US Dollar' },
            availableCrypto: cryptosToCreateWalletFor,
            fee: fee
        }

    return res.status(200).json({ message: 'payment page details recieved', details: data });
}