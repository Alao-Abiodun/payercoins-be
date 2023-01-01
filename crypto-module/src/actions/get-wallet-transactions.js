const WalletTransactionRepository = require('../repositories/wallet-transaction');
const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');

module.exports = (configs, environment) => async (clientId, cryptoType) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // validate avaialableCrypto is an array of string
    if (!cryptoType) {
        throw new Error('The cryptoType must be a string');
    }

    // load the database
    const database = require('../../database/models')({ environment });


    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // filter crypto types to only those that are not in the database
    const invalidCryptoTypes = [cryptoType].filter(cryptoType => !cryptos.map(crypto => crypto.slug).includes(cryptoType));

    // validate if invalid crypto types are present
    if (invalidCryptoTypes.length > 0) {
        throw new Error(`Invalid crypto types: ${invalidCryptoTypes.join(', ')}`);
    }

    // get the specific crypto
    const cryptosToCreateTransactionFor = cryptos.find(c => c.slug === cryptoType);

    // check if crypto is valid
    if (!cryptosToCreateTransactionFor) {
        return res.status(422).json({ message: 'crypto is invalid' });
    }

    const cryptoWalletData = await cryptoWalletRepository.findOne(database, clientId, cryptosToCreateTransactionFor.id);

    if (!cryptoWalletData) {
        throw new Error(`User does not have Crypto Wallet for: ${cryptosToCreateTransactionFor.slug}`);
    }

    const cryptoWallet = cryptoWalletData.get();

    const transactions = await WalletTransactionRepository.findAllWithCryptoWalletId(database, cryptoWallet.id);

    if (!transactions) {
        throw new Error('Invalid reference for Payment Page');
    }

    return { transactions: transactions.map(p => p.get()) }
}