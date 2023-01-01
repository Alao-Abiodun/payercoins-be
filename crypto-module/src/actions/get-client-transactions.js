const cryptoRepository = require('../repositories/crypto');
const cryptoWalletTransactionRepository = require('../repositories/transaction');

module.exports = (configs, environment) => async (clientId, pageSize, page) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    // load the database
    const database = require('../../database/models')({ environment });
    //let pageSize = 10;
    // create address and generate address
    const absPage = Math.abs(page-1);
    const offset = absPage * pageSize;
    const limit = pageSize;
    const transactions = await cryptoWalletTransactionRepository.findAllWithClienIdWithRelationship(database, clientId, limit, offset);
    // return the wallets
    return { transactions: transactions.rows, totalPage: Math.ceil(transactions.count / pageSize), page: absPage, perPage: pageSize, count: transactions.count };
}