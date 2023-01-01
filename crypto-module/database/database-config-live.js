const configuration = require('../config/index')

module.exports = {
  "development": configuration.db.live.sequelize,
  "test": configuration.db.live.sequelize,
  "production": configuration.db.live.sequelize
};