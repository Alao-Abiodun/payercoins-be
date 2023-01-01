const model = require('./model');
const modelName = 'Crypto'

const create = async (database, data, transaction = null) => {
    const options = transaction ? { nest: true, raw: true, transaction } : { nest: true, raw: true };
    return await model.create(database, modelName, data, [], options);
}

// const findAll = async (database, wheres, orders, includes) => {
//     return await model.findAll(database, modelName, wheres, orders, includes);
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

const findAll = async (database) => {
    return await model.findAll(database, modelName, {'isActive': 'TRUE'}, [['id', 'ASC']], [], { nest: true, raw: true,});
}

const findOne = async (database, type) => {
    return await model.findOne(database, modelName, {type}, [], [], {nest: true, plain: true });
}

const getCryptoBySymbol = async (database, symbol) => {
  return await model.findOne(database, modelName, { symbol }, [], [], {nest: true, plain: true });
}

module.exports = {
    create,
    // findAll,
    findOne,
    // findByPk,
    // update,
    // destroy,
    findAll,
    getCryptoBySymbol,
}