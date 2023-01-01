"use strict";
module.exports = function (sequelize, DataTypes) {
  var PaymentPageTransaction = sequelize.define("PaymentPageTransaction", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    transactionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'transactions', key: 'id' } },
    paymentPageId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'payment_pages', key: 'id' } },
    cryptoWalletId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'crypto_wallets', key: 'id' } },
    amountInUsd: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    amountInCrypto: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    confirmedAmountInUsd: { type: DataTypes.DECIMAL(45, 25), allowNull: true },
    confirmedAmountInCrypto: { type: DataTypes.DECIMAL(45, 25), allowNull: true },
    rate: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    metaData: { type: DataTypes.JSON, allowNull: false },
  }, {
    classMethods: {},

    indexes: [
      { fields: ['transactionId'] },
      { fields: ['paymentPageId'] },
      { fields: ['cryptoWalletId'] },
      { unique: true, fields: ['uuid'] },
    ],

    tableName: 'payment_page_transactions'
  });

  PaymentPageTransaction.associate = function (models) {
    // associations can be defined here
    PaymentPageTransaction.belongsTo(models.Transaction, { foreignKey: 'transactionId', as: 'transaction' })
    PaymentPageTransaction.belongsTo(models.PaymentPage, { foreignKey: 'paymentPageId', as: 'paymentPage' })
    PaymentPageTransaction.belongsTo(models.CryptoWallet, { foreignKey: 'cryptoWalletId', as: 'cryptoWallet' })
    PaymentPageTransaction.hasOne(models.Address, { foreignKey: 'addressableId', as: 'address', constraints: false, scope: { addressableType: 'page' } })
    PaymentPageTransaction.hasMany(models.Transfer, { foreignKey: 'transferableId', as: 'transfers', constraints: false, scope: { transferableType: 'page' } })
  }

  return PaymentPageTransaction;
};