const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const PaymentPageRepository = require('../repositories/payment-page');
const helper = require('../helpers');

module.exports = (configs, environment) => async (clientId, availableCrypto, amount, amountType, { description, name }) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // validate amountType is either 'fixed' or 'custom'
    if (!amountType || !['fixed', 'custom'].includes(amountType)) {
        throw new Error('AmountType is required and must be either "fixed" or "custom"');
    }

    // if amountType is fixed then validate amount is present and is an float else turn amount to 0
    if (amountType === 'fixed') {
        if (!amount || !Number.isFinite(amount)) {
            throw new Error('Amount is required and must be a Float when amountType is set to fixed');
        }
    } else {
        amount = 0;
    }

    // validate availableCrypto is an array of string
    if (!Array.isArray(availableCrypto)) {
        throw new Error('The availableCrypto must be an array of string');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // filter crypto types to only those that are not in the database
    const invalidCryptoTypes = availableCrypto.filter(cryptoType => !cryptos.map(crypto => crypto.slug).includes(cryptoType));

    // validate if invalid crypto types are present
    if (invalidCryptoTypes.length > 0) {
        throw new Error(`The following crypto types are not valid: ${invalidCryptoTypes.join(', ')}`);
    }

    // filter the cryptos by the ones that are in the list
    const cryptosThatUserWantsToBePaidIn = cryptos.filter(crypto => availableCrypto.includes(crypto.slug));

    // check if user already has any of the crypto wallets types
    const userCryptoWallets = await cryptoWalletRepository.findAll(database, { clientId: clientId });

    // crypto wallet the user does not have
    const cryptoWalletTheUserDoesntHave = cryptosThatUserWantsToBePaidIn.filter(crypto => !userCryptoWallets.map(crypto => crypto.cryptoId).includes(crypto.id));

    // validate if user does wallet for the crypto
    if (cryptoWalletTheUserDoesntHave.length > 0) {
        throw new Error(`The User does not have crypto wallet for: ${cryptoWalletTheUserDoesntHave.map(crypto => crypto.slug).join(', ')}`);
    }

    const metaData = { description, name };
    const reference = helper.generate.generateString(40);
    const status = 'active';

    const createdPaymentPage = await PaymentPageRepository.create(database, { reference, clientId, amount, amountType, availableCrypto, status, metaData });

    return { link: configs.url[environment].paymentPageUrl + reference, details: createdPaymentPage }
}