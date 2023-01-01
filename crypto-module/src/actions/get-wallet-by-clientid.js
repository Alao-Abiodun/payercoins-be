const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');

module.exports = (configs, environment) => async (clientId) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get all users crypto wallets
    const userCryptoWallets = await cryptoWalletRepository.findAllWithCrypto(database, clientId);

    // return the wallets
    return { wallets: userCryptoWallets };
}