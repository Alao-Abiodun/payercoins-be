const model = require('./model');
const modelName = 'CryptoWalletTransaction'

const create = async (database, data, transaction = null) => {
    const options = transaction ? { nest: true, raw: true, transaction } : { nest: true, raw: true };
    return await model.create(database, modelName, data, [], options);
}

const updateWithId = async (database, id, data, transaction = null) => {
    const options = transaction ? { transaction } : {};
    return await model.update(database, modelName, data, { id }, [], [], options);
}

// const updateWithId = async (database, id, data ) => {
//     return await model.update(database, modelName, data, {id}, [], [], {});
// }

// const findOneWithCryptoWalletTransaction = async (database, clientId, reference) => {
//     return await model.findOne(database, modelName, {clientId, reference}, [], [{model: database['CryptoWalletTransaction'], as: 'CryptoWalletTransactions'}], {nest: true, plain: true });
// }

// const findAllWithCryptoWalletTransaction = async (database, clientId) => {
//     return await model.findAll(database, modelName, {clientId}, [], [{model: database['CryptoWalletTransaction'], as: 'CryptoWalletTransactions'}], {});
// }

// const findOneWithCryptoWalletTransactionWithoutClient = async (database, reference) => {
//     return await model.findOne(database, modelName, {reference}, [], [{model: database['CryptoWalletTransaction'], as: 'CryptoWalletTransactions'}], {nest: true, plain: true });
// }

// const findOneWithIdTransactionWithoutClient = async (database, id) => {
//     return await model.findOne(database, modelName, {id}, [], [{model: database['CryptoWalletTransaction'], as: 'CryptoWalletTransactions'}], {nest: true, plain: true });
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

const findOneCryptoWalletTransactionWithoutClient = async (database, reference) => {
    return await model.findOne(database, modelName, { reference }, [],
        [
            { model: database['Transfer'], as: 'transfer' },
        ],
        { nest: true, plain: true });
}

const findByPk = async (database, id) => {
    return await model.findByPk(database, modelName, id, [], [], { nest: true, plain: true })
}

const findOneCryptoWalletTransactionWithId = async (database, id) => {
    return await model.findOne(database, modelName, { id }, [],
        [
            { model: database['Transfer'], as: 'transfer' },
        ],
        { nest: true, plain: true });
}

const findCryptoWalletTransactionByTransactionId = async (database, transactionId) => {
  return await model.findOne(database, modelName, { transactionId }, [],
      [
          { model: database['Transfer'], as: 'transfer' },
      ],
      { nest: true, plain: true });
}

// const findOne = async (database, id, vout_index) => {
//     return await model.findOne(database, modelName, {txid, vout_index}, [], [], {nest: true, plain: true });
// }

// const destroy = async (database, wheres, orders) => {
//     return await model.findOne(database, modelName, wheres, orders, includes);
// }

// const update = async (database, wheres, orders) => {
//     return await model.findOne(database, modelName, wheres, orders, includes);
// }

const findAll = async (database) => {
    return await model.findAll(database, modelName, {}, [['id', 'ASC']], [], { nest: true, raw: true, });
}

const findAllWithCryptoWalletId = async (database, cryptoWalletId) => {
    return await model.findAll(database, modelName, { cryptoWalletId }, [], [
        { model: database['Transfer'], as: 'transfer' },
    ], {});
}

const findCryptoWalletTransactionWithUuid = async (database, uuid) => {
  return await model.findOne(
    database,
    modelName,
    { uuid },
    [],
    [{ model: database["Transfer"], as: "transfer" }],
    { nest: true, plain: true }
  );
};

module.exports = {
    create,
    // findOneWithCryptoWalletTransaction,
    // findAllWithCryptoWalletTransaction,
    // findOneWithCryptoWalletTransactionWithoutClient,
    // findOneWithIdTransactionWithoutClient,
    updateWithId,
    findOneCryptoWalletTransactionWithoutClient,
    // findAllWithCrypto,
    findAllWithCryptoWalletId,
    findAll,
    findOneCryptoWalletTransactionWithId,
    // findCryptoWalletsWithCryptoWhereIn,
    // findCryptoWalletsWithCryptoWhereInCrypto,
    // findOne,
    findByPk,
    // update,
    // destroy,
    // findAll
    findCryptoWalletTransactionWithUuid,
    findCryptoWalletTransactionByTransactionId,
}