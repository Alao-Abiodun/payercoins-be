const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const AddressRepository = require('../repositories/address');

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
    const cryptosToGetTransactionFor = cryptos.find(c => c.slug === cryptoType);

    // check if crypto is valid
    if (!cryptosToGetTransactionFor) {
        return res.status(422).json({ message: 'crypto is invalid' });
    }

    // findOne
    const cryptoWalletData = await cryptoWalletRepository.findOne(database, clientId, cryptosToGetTransactionFor.id);

    if (!cryptoWalletData) {
        throw new Error(`User does not have Crypto Wallet for: ${cryptosToGetTransactionFor.slug}`);
    }
    
    const cryptoWallet = cryptoWalletData.get();

    // create address and generate address
    const address = await AddressRepository.findCryptoAddressViaClientAndCrypto(database, cryptoWallet.id, cryptosToGetTransactionFor.id);

    // return the wallets
    return { addresses: address };
}