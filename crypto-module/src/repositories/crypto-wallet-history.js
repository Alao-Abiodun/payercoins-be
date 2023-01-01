const model = require('./model');
const modelName = 'CryptoWalletHistory'

const create = async (database, data, transaction = null) => {
    const options = transaction ? { nest: true, raw: true, transaction } : { nest: true, raw: true };
    return await model.create(database, modelName, data, [], options);
}

const findAllWithCrypto = async (database, clientId) => {
    return await model.findAll(database, modelName, {clientId}, [], [{model: database['Crypto'], as: 'crypto'}], { nest: true, raw: true,});
}

const findAllByClient = async (database, clientId) => {
    return await model.findAll(database, modelName, {clientId}, [], [], { nest: true, raw: true,});
}

const findCryptoWalletsWithCryptoWhereIn = async (database, clientId, cryptoWalletIds) => {
    return await model.findAll(database, modelName, {clientId, id: cryptoWalletIds}, [], [{model: database['Crypto'], as: 'crypto'}], { nest: true, raw: true,});
}

const findCryptoWalletsWithCryptoWhereInCrypto = async (database, clientId, cryptoIds) => {
    return await model.findAll(database, modelName, {clientId, cryptoId: cryptoIds}, [], [{model: database['Crypto'], as: 'crypto'}], { nest: true, raw: true,});
}

const findOne = async (database, clientId, cryptoId) => {
    return await model.findOne(database, modelName, {clientId, cryptoId}, [], [], { nest: true, raw: true,});
}

const findByTransactionId = async (database, transactionId) => {
    return await model.findOne(database, modelName, { transactionId }, [], [], { nest: true, raw: true,});
}

// const findOne = async (database, wheres, orders, includes) => {
//     return await model.findOne(database, modelName, wheres, orders, includes);
// }

// const findByPk = async (database, id) => {
//     return await model.findByPk(database, modelName ,id);
// }

// const destroy = async (database, wheres, orders) => {
//     return await model.findOne(database, modelName, wheres, orders, includes);
// }

// const update = async (database, wheres, orders) => {
//     return await model.findOne(database, modelName, wheres, orders, includes);
// }

const findAll = async (database) => {
    return await model.findAll(database, modelName, {}, [['id', 'ASC']], []);
}

const updateWithId = async (database, id, data, transaction = null ) => {
    const options = transaction ? {transaction } : {};
    return await model.update(database, modelName, data, {id}, [], [], options);
}

module.exports = {
    create,
    findAllWithCrypto,
    findAll,
    findCryptoWalletsWithCryptoWhereIn,
    findCryptoWalletsWithCryptoWhereInCrypto,
    findOne,
    findAllByClient,
    updateWithId,
    findByTransactionId,
    // findOne,
    // findByPk,
    // update,
    // destroy,
    // findAll
}