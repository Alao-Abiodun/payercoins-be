const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const PaymentLinkRepository = require('../repositories/payment-link');
const helper = require('../helpers');

module.exports = (configs, environment) => async (clientId, availableCrypto, amount, amountType, countDownTime, type, { description, email, name, invoiceId, callbackUrl }) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // validate if countDownTime is present and is an Integer
    if (!countDownTime || !Number.isInteger(countDownTime)) {
        throw new Error('Count Down Time is required and must be an Integer (In Seconds)');
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

    // validate the type param to be either 'donation', 'checkout' or 'api'
    if (!['donation', 'checkout', 'api'].includes(type)) {
        throw new Error('The type of the payment link must be either "donation", "checkout" or "api"');
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
        console.log(`The following crypto types are not valid: ${invalidCryptoTypes.join(', ')}`);
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

    const metaData = { description, email, name, invoiceId, callbackUrl };
    const expiresAt = new Date(Date.now() + (countDownTime * 60 * 1000));
    const status = 'pending';
    const reference = helper.generate.generateString(40);

    const createdPaymentLink = await PaymentLinkRepository.create(database, { reference, clientId, amount, amountType, type, availableCrypto, status, metaData, expiresAt });

    return { link: configs.url[environment].paymentLinkUrl + createdPaymentLink.reference, details: createdPaymentLink }
}