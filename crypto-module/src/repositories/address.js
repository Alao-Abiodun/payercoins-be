const model = require('./model');
const modelName = 'Address'

const create = async (database, data, transaction = null) => {
    const options = transaction ? { nest: true, raw: true, transaction } : { nest: true, raw: true };
    return await model.create(database, modelName, data, [], options);
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

const findOne = async (database, address) => {
    return await model.findOne(database, modelName, { address }, [], [], { nest: true, plain: true });
}

const findCryptoAddressViaClientAndCrypto = async (database, walletId, cryptoId) => {
    return await model.findAll(database, modelName, { addressableId: walletId, addressableType: 'wallet', cryptoId }, [], [], { nest: true, raw: true, });
}


module.exports = {
    create,
    findCryptoAddressViaClientAndCrypto,
    // findOneWithPaymentLinkTransaction,
    // findAllWithPaymentLinkTransaction,
    // findOneWithPaymentLinkTransactionWithoutClient,
    // findOneWithIdTransactionWithoutClient,
    // updateWithId,
    // findAllWithCrypto,
    // findAll,
    // findCryptoWalletsWithCryptoWhereIn,
    // findCryptoWalletsWithCryptoWhereInCrypto,
    findOne,
    // findByPk,
    // update,
    // destroy,
    // findAll
}