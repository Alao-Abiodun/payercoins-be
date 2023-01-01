"use strict";
module.exports = function (sequelize, DataTypes) {
  var Transaction = sequelize.define("Transaction", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    cryptoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'cryptos', key: 'id' } },
    clientId: { type: DataTypes.UUID, allowNull: false },
    transferableType: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    declinedAt: { type: DataTypes.DATE, allowNull: true },
    declinedReason: { type: DataTypes.TEXT, allowNull: true }
  }, {
    classMethods: {},

    indexes: [
      { fields: ['cryptoId'] },
      { fields: ['clientId'] },
      { unique: true, fields: ['uuid'] },
      { unique: false, fields: ['transferableType'] },
      { fields: ['cryptoId', 'transferableType'] },
    ],

    tableName: 'transactions'
  });

  Transaction.associate = function (models) {
    // associations can be defined here
    Transaction.belongsTo(models.Crypto, { foreignKey: 'cryptoId', as: 'crypto' })
    Transaction.hasMany(models.PaymentLinkTransaction, { foreignKey: 'transactionId', as: 'paymentLinkTransaction' })
    Transaction.hasMany(models.PaymentPageTransaction, { foreignKey: 'transactionId', as: 'paymentPageTransaction' })
    Transaction.hasMany(models.CryptoWalletHistory)
    Transaction.hasMany(models.CryptoWalletTransaction, { foreignKey: 'transactionId', as: 'cryptoWalletTransaction' })
  }

  return Transaction;
};