const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env')})

const env = process.env.NODE_ENV || 'development'
const configFromFile = require(path.resolve(__dirname, env))

const config = {
    ...configFromFile,
    env
}

module.exports = config