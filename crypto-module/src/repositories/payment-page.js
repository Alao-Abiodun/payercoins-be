const model = require('./model');
const modelName = 'PaymentPage'

const create = async (database, data = { reference, clientId, amount, amountType, avaialableCrypto, status, metaData }, transaction = null) => {
    const options = transaction ? { nest: true, raw: true, transaction } : { nest: true, raw: true };
    return await model.create(database, modelName, data, [], options);
}

const updateWithId = async (database, id, data, transaction = null) => {
    const options = transaction ? { transaction } : {};
    return await model.update(database, modelName, data, { id }, [], [], options);
}

const findOneWithPaymentPageTransaction = async (database, clientId, reference) => {
    return await model.findOne(database, modelName, { clientId, reference }, [], [
        {
            model: database['PaymentPageTransaction'],
            include: [
                { model: database['Address'], as: 'address' },
                { model: database['Transfer'], as: 'transfers' },
            ],
            as: 'paymentPageTransactions'
        }
    ], { nest: true, plain: true });
}

const findOne = async (database, reference) => {
    return await model.findOne(database, modelName, { reference }, [], [], { nest: true, plain: true });
}

const findOneById = async (database, id) => {
    return await model.findOne(database, modelName, { id }, [], [], { nest: true, plain: true });
}

const findOneWithPaymentPageTransactionUsingId = async (database, id) => {
    return await model.findByPk(database, modelName, id, [
        {
            model: database['PaymentPageTransaction'],
            include: [
                { model: database['Address'], as: 'address' },
                { model: database['Transfer'], as: 'transfers' },
            ],
            as: 'paymentPageTransactions'
        }
    ], { nest: true, plain: true });
}

const findAllWithPaymentPageTransaction = async (database, clientId) => {
    return await model.findAll(database, modelName, { clientId }, [], [
        {
            model: database['PaymentPageTransaction'],
            include: [
                { model: database['Address'], as: 'address' },
                { model: database['Transfer'], as: 'transfers' },
            ],
            as: 'paymentPageTransactions'
        }
    ], {});
}

const findAllWithClient = async (database, clientId) => {
    return await model.findAll(database, modelName, { clientId }, [], [], {});
}

const findOneWithPaymentPageTransactionWithoutClient = async (database, reference) => {
    return await model.findOne(database, modelName, { reference }, [], [
        {
            model: database['PaymentPageTransaction'],
            include: [
                { model: database['Address'], as: 'address' },
                { model: database['Transfer'], as: 'transfers' },
            ],
            as: 'paymentPageTransactions'
        }
    ], { nest: true, plain: true });
}

const findOneWithClient = async (database, clientId, reference) => {
    return await model.findOne(database, modelName, { clientId, reference }, [], [], { nest: true, plain: true });
}

const findOneWithWithoutReference = async (database, reference) => {
    return await model.findOne(database, modelName, { reference }, [], [], { nest: true, plain: true });
}

const findOneWithIdTransactionWithoutClient = async (database, id) => {
    return await model.findOne(database, modelName, { id }, [], [
        {
            model: database['PaymentPageTransaction'],
            include: [
                { model: database['Address'], as: 'address' },
                { model: database['Transfer'], as: 'transfers' },
            ],
            as: 'paymentPageTransactions'
        }
    ], { nest: true, plain: true });
}

const findAll = async (database) => {
    return await model.findAll(database, modelName, {}, [['id', 'ASC']], [], { nest: true, raw: true, });
}

module.exports = {
    create,
    findOneWithClient,
    findOneWithPaymentPageTransaction,
    findAllWithPaymentPageTransaction,
    findOneWithPaymentPageTransactionWithoutClient,
    findOneWithIdTransactionWithoutClient,
    updateWithId,
    findOneWithPaymentPageTransactionUsingId,
    findAllWithClient,
    findAll,
    findOneWithWithoutReference,
    findOneById,
    // findCryptoWalletsWithCryptoWhereIn,
    // findCryptoWalletsWithCryptoWhereInCrypto,
    findOne,
    // findByPk,
    // update,
    // destroy,
    // findAll
}