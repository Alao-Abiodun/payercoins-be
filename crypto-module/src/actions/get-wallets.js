const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');

module.exports = (configs, environment) => async (clientId, cryptoTypes) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // validate avaialableCrypto is an array of string
    if (!Array.isArray(cryptoTypes)) {
        throw new Error('The cryptoTypes must be an array of string');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // filter crypto types to only those that are not in the database
    const invalidCryptoTypes = cryptoTypes.filter(cryptoType => !cryptos.map(crypto => crypto.slug).includes(cryptoType));

    // filter crypto types to only those that are in the database
    const validCryptoTypes = cryptoTypes.filter(cryptoType => cryptos.map(crypto => crypto.slug).includes(cryptoType));

    // filter the cryptos by the ones that are in the list
    const cryptosToGetUserCryptoWalletsFor = cryptos.filter(crypto => validCryptoTypes.includes(crypto.slug));

    // valisate if invalid crypto types are present
    if (invalidCryptoTypes.length > 0) {
        //(`Invalid crypto types: ${invalidCryptoTypes.join(', ')}`);
    }

    // get all users crypto wallets
    const userCryptoWalletsWithCrypto = await cryptoWalletRepository.findCryptoWalletsWithCryptoWhereInCrypto(database, clientId,
        cryptosToGetUserCryptoWalletsFor.map(crypto => crypto.id));

    // validate if wallets are present
    if (userCryptoWalletsWithCrypto.length === 0) {
        throw new Error(`No wallets found for: ${cryptoTypes.join(', ')}`);
    }

    // return the wallets
    return { wallets: userCryptoWalletsWithCrypto };
}