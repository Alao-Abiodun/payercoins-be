const cryptoRepository = require('../repositories/crypto');

module.exports = (configs, environment) => async () => {
    // load the database
    const database = require('../../database/models')({ environment });

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);
    
    // return the wallets
    return { cryptos: cryptos };
}