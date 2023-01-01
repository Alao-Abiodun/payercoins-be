const model = require('./model');
const modelName = 'Transaction'

const create = async (database, data, transaction = null) => {
    const options = transaction ? { nest: true, raw: true, transaction } : { nest: true, raw: true };
    return await model.create(database, modelName, data, [], options);
}

const updateWithId = async (database, id, data, transaction = null ) => {
    const options = transaction ? {transaction } : {};
    return await model.update(database, modelName, data, {id}, [], [], options);
}

const findByPk = async (database, id) => {
    return await model.findByPk(database, modelName, id, [], [], { nest: true, plain: true })
}

const findAllWithClienId = async (database, clientId) => {
    return await model.findAll(database, modelName, { clientId }, [], [], {});
}

const findAllWithClienIdWithRelationship = async (database, clientId, limit, offset) => {
    return await model.findAndCountAll(database, modelName, { clientId }, [['id', 'DESC']], [
        { model: database['CryptoWalletTransaction'], as: 'cryptoWalletTransaction' },
        { model: database['PaymentPageTransaction'], as: 'paymentPageTransaction' },
        { model: database['Crypto'], as: 'crypto' },
    ], { limit: limit, offset: offset })
}

const findAll = async (database) => {
    return await model.findAll(database, modelName, {}, [['id', 'ASC']], [], { nest: true, raw: true,});
}

// const updateWithId = async (database, id, data ) => {
//     return await model.update(database, modelName, data, {id}, [], [], {});
// }

// const findOneWithPaymentLinkTransaction = async (database, clientId, reference) => {
//     return await model.findOne(database, modelName, {clientId, reference}, [], [{model: database['PaymentLinkTransaction'], as: 'paymentLinkTransactions'}], {nest: true, plain: true });
// }

// const findAllWithPaymentLinkTransaction = async (database, clientId) => {
//     return await model.findAll(database, modelName, {clientId}, [], [{model: database['PaymentLinkTransaction'], as: 'paymentLinkTransactions'}], {});
// }

// const findOneWithPaymentLinkTransactionWithoutClient = async (database, reference) => {
//     return await model.findOne(database, modelName, {reference}, [], [{model: database['PaymentLinkTransaction'], as: 'paymentLinkTransactions'}], {nest: true, plain: true });
// }

// const findOneWithIdTransactionWithoutClient = async (database, id) => {
//     return await model.findOne(database, modelName, {id}, [], [{model: database['PaymentLinkTransaction'], as: 'paymentLinkTransactions'}], {nest: true, plain: true });
// }

// const findAllWithCrypto = async (database, clientId) => {
//     return await model.findAll(database, modelName, {clientId}, [], [{model: database['Crypto'], as: 'crypto'}], { nest: true, raw: true,});
// }

// const findCryptoWalletsWithCryptoWhereIn = async (database, clientId, cryptoWalletIds) => {
//     return await model.findAll(database, modelName, {clientId, id: cryptoWalletIds}, [], [{model: database['Crypto'], as: 'crypto'}], { nest: true, raw: true,});
// }

// const findCryptoWalletsWithCryptoWhereInCrypto = async (database, clientId, cryptoIds) => {
//     return await model.findAll(database, modelName, {clientId, cryptoId: cryptoIds}, [], [{model: database['Crypto'], as: 'crypto'}], { nest: true, raw: true,});
// }

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

// const findAll = async (database) => {
//     return await model.findAll(database, modelName, {}, [['id', 'ASC']], []);
// }

module.exports = {
    create,
    updateWithId,
    // findOneWithPaymentLinkTransaction,
    // findAllWithPaymentLinkTransaction,
    // findOneWithPaymentLinkTransactionWithoutClient,
    // findOneWithIdTransactionWithoutClient,
    // updateWithId,
    // findAllWithCrypto,
    // findAll,
    // findCryptoWalletsWithCryptoWhereIn,
    // findCryptoWalletsWithCryptoWhereInCrypto,
    // findOne,
    findByPk,
    findAllWithClienId,
    findAllWithClienIdWithRelationship,
    // update,
    // destroy,
    findAll
}