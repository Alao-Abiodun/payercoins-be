const configuration = require('../config/index')

module.exports = {
  "development": configuration.db.sandbox.sequelize,
  "test": configuration.db.sandbox.sequelize,
  "production": configuration.db.sandbox.sequelize
};