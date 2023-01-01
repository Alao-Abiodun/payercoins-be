"use strict";
module.exports = function (sequelize, DataTypes) {
  var CryptoWalletTransaction = sequelize.define("CryptoWalletTransaction", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    transactionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'transactions', key: 'id' } },
    cryptoWalletId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'crypto_wallets', key: 'id' } },
    amount: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    fee: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    memo: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
  }, {
    classMethods: {},

    indexes: [
      { fields: ['transactionId'] },
      { fields: ['cryptoWalletId'] },
      { unique: true, fields: ['uuid'] },
    ],

    tableName: 'crypto_wallet_transactions'
  });

  CryptoWalletTransaction.associate = function (models) {
    // associations can be defined here
    CryptoWalletTransaction.belongsTo(models.Transaction, { foreignKey: 'transactionId', as: 'transaction' })
    CryptoWalletTransaction.belongsTo(models.CryptoWallet, { foreignKey: 'cryptoWalletId', as: 'cryptoWallet' })
    CryptoWalletTransaction.hasOne(models.Transfer, { foreignKey: 'transferableId', as: 'transfer', constraints: false, scope: { transferableType: 'wallet' } })
  }

  return CryptoWalletTransaction;
};