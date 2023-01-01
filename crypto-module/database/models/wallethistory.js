"use strict";
module.exports = function(sequelize, DataTypes) {
  var CryptoWalletHistory = sequelize.define("CryptoWalletHistory", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cryptoWalletId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'crypto_wallets', key: 'id' }},
    transactionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'transactions', key: 'id' }},
    previousBalance: { type: DataTypes.DECIMAL(45,25), allowNull: false },
    currentBalance: { type: DataTypes.DECIMAL(45,25), allowNull: false },
  }, {
    classMethods: {},

    indexes: [
      { fields: ['cryptoWalletId'] },
      { fields: ['transactionId'] },
    ],

    tableName: 'crypto_wallet_histories'
  });

  CryptoWalletHistory.associate = function(models) {
    // associations can be defined here
    CryptoWalletHistory.belongsTo(models.CryptoWallet)
    CryptoWalletHistory.belongsTo(models.Transaction)
  }

  return CryptoWalletHistory;
};