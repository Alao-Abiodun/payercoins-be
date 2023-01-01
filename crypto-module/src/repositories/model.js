const create = async (database, model, data, includes,  options) => {
    return (await database[model].create(data, {include: includes, ...options })).get({plain:true});
}

const findAll = async (database, model, wheres, orders, includes, options) => {
    return await database[model].findAll({ where: wheres, order: orders, include: includes, ...options })
}

const findAndCountAll = async (database, model, wheres, orders, includes, options) => {
    return await database[model].findAndCountAll({ where: wheres, order: orders, include: includes, ...options })
}

const findOne = async (database, model, wheres, orders, includes, options) => {
    return await database[model].findOne({ where: wheres, order: orders, include: includes });
}

const findByPk = async (database, model, id, includes, options) => {
    return await database[model].findByPk(id, { include:includes, ...options });
}

const destroy = async (database, model, wheres, orders, options) => {
    return await database[model].destroy({ where: wheres, order: orders });
}

const update = async (database, model, data, wheres, orders, includes, options) => {
    return await database[model].update(data, { where: wheres, order: orders, include: includes, ...options});
}

module.exports = {
    create,
    findAll,
    findOne,
    findByPk,
    findAndCountAll,
    update,
    destroy
}