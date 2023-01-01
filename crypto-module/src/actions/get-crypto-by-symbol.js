const cryptoRepository = require('../repositories/crypto');

module.exports = (configs, environment) => async (symbol) => {
    // load the database
    const database = require('../../database/models')({ environment });

    // get all crypto types
    const crypto = await cryptoRepository.getCryptoBySymbol(database, symbol);
    console.log(crypto, 'ABIODUN')
    
    // return the wallet
    return crypto;
}