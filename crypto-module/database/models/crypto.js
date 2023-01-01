"use strict";
module.exports = function(sequelize, DataTypes) {
  var Crypto = sequelize.define("Crypto", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    symbol: { type: DataTypes.STRING, allowNull: false },
    sign: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    classMethods: {

    },

    indexes: [
      { unique: true, fields: ['uuid'] },
      { unique: true, fields: ['slug'] },
      { fields: ['isActive'] }
    ],

    tableName: 'cryptos'
  });

  Crypto.associate = function(models) {
    // associations can be defined here
    Crypto.hasMany(models.Address, {foreignKey: 'cryptoId'})
    Crypto.hasMany(models.Transfer, {foreignKey: 'cryptoId'})
    Crypto.hasMany(models.Transaction, {foreignKey: 'cryptoId'})
    Crypto.hasMany(models.CryptoWallet, {foreignKey: 'cryptoId'})
  }

  return Crypto;
};