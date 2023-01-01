"use strict";
module.exports = function (sequelize, DataTypes) {
  var CryptoWallet = sequelize.define("CryptoWallet", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    cryptoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'cryptos', key: 'id' } },
    clientId: { type: DataTypes.UUID, allowNull: false },
    balance: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    classMethods: {},

    indexes: [
      { fields: ['clientId'] },
      { fields: ['cryptoId'] },
      { unique: true, fields: ['uuid'] },
      { fields: ['clientId', 'cryptoId'] },
    ],

    tableName: 'crypto_wallets'
  });

  CryptoWallet.associate = function (models) {
    // associations can be defined here
    CryptoWallet.belongsTo(models.Crypto, { foreignKey: 'cryptoId', as: 'crypto' });
    CryptoWallet.hasMany(models.PaymentLinkTransaction, { foreignKey: 'cryptoWalletId', as: 'payemtLinkTransaction' })
    CryptoWallet.hasMany(models.CryptoWalletHistory)
    CryptoWallet.hasMany(models.CryptoWalletTransaction,  { foreignKey: 'cryptoWalletId', as: 'cryptoWalletTransaction' })
  }

  return CryptoWallet;
};