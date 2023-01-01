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

    // filter the cryptos by the ones that are in the list
    const cryptosToCreateWalletFor = cryptos.filter(crypto => cryptoTypes.includes(crypto.slug));

    // validate if invalid crypto types are present
    if (invalidCryptoTypes.length > 0) {
        throw new Error(`Invalid crypto types: ${invalidCryptoTypes.join(', ')}`);
    }

    // check if user already has any of the crypto wallets types
    const userCryptoWallets = await cryptoWalletRepository.findAllByClient(database, clientId);

    // crypto wallet not to create
    const cryptoWalletCryptoTypesToNotCreate = cryptosToCreateWalletFor.filter(crypto => userCryptoWallets.map(cryptoWallet => cryptoWallet.cryptoId).includes(crypto.id));

    // validate if user already has any of the crypto wallets types
    if (cryptoWalletCryptoTypesToNotCreate.length > 0) {
        throw new Error(`User already has a wallet for ${cryptoWalletCryptoTypesToNotCreate.map(crypto => crypto.slug).join(', ')}`);
    }

    // loop through the cryptos and create wallets for each
    const wallets = await Promise.all(cryptosToCreateWalletFor.map(async (crypto) => {
        return await cryptoWalletRepository.create(database,
            {
                cryptoId: crypto.id,
                clientId: clientId,
                balance: 0.00
            }
        )
    }));

    // eager load wallets with crypto
    const cryptoWalletsMadeWithCrypto = await cryptoWalletRepository.findCryptoWalletsWithCryptoWhereIn(database, clientId, wallets.map(wallet => wallet.id));

    // return the wallets
    return { wallets: cryptoWalletsMadeWithCrypto };
}

// 08180420820