const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const AddressRepository = require('../repositories/address');
const addressService = require('../services/treshold/generate-address');
const { generateString } = require('../helpers/generate');

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
        throw new Error('crypto is invalid');
    }

    // generate address
    const response = await addressService(configs.treshold, environment)(cryptosToCreateTransactionFor.symbol, generateString(10));

    if (!response.status) {
        throw new Error('payment link is down at the moment, try again');
    }

    // findOne
    const cryptoWalletData = await cryptoWalletRepository.findOne(database, clientId, cryptosToCreateTransactionFor.id);

    if (!cryptoWalletData) {
        throw new Error(`User does not have Crypto Wallet for: ${cryptosToCreateTransactionFor.slug}`);
    }

    const cryptoWallet = cryptoWalletData.get();

    // create address and generate address
    const address = await AddressRepository.create(database, {
        cryptoId: cryptosToCreateTransactionFor.id,
        addressableType: 'wallet',
        addressableId: cryptoWallet.id,
        address: response.address,
        label: 'wallet-' + cryptoWallet.id,
        isActive: true,
        memo: response.memo
    });

    // return the wallets
    return { address: address };
}