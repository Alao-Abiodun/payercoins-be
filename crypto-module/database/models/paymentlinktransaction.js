"use strict";
module.exports = function (sequelize, DataTypes) {
  var PaymentLinkTransaction = sequelize.define("PaymentLinkTransaction", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    transactionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'transactions', key: 'id' } },
    paymentLinkId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'payment_links', key: 'id' } },
    cryptoWalletId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'crypto_wallets', key: 'id' } },
    amountInUsd: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    amountInCrypto: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    confirmedAmountInUsd: { type: DataTypes.DECIMAL(45, 25), allowNull: true },
    confirmedAmountInCrypto: { type: DataTypes.DECIMAL(45, 25), allowNull: true },
    rate: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
  }, {
    classMethods: {},

    indexes: [
      { fields: ['transactionId'] },
      { fields: ['paymentLinkId'] },
      { fields: ['cryptoWalletId'] },
      { unique: true, fields: ['uuid'] },
    ],

    tableName: 'payment_link_transactions'
  });

  PaymentLinkTransaction.associate = function (models) {
    // associations can be defined here
    PaymentLinkTransaction.belongsTo(models.Transaction, { foreignKey: 'transactionId', as: 'transaction' })
    PaymentLinkTransaction.belongsTo(models.PaymentLink, { foreignKey: 'paymentLinkId', as: 'paymentLink' })
    PaymentLinkTransaction.belongsTo(models.CryptoWallet, { foreignKey: 'cryptoWalletId', as: 'cryptoWallet' })
    PaymentLinkTransaction.hasOne(models.Address, { foreignKey: 'addressableId', as: 'address', constraints: false, scope: { addressableType: 'link' } })
    PaymentLinkTransaction.hasMany(models.Transfer, { foreignKey: 'transferableId', as: 'transfer', constraints: false, scope: { transferableType: 'link' } })
  }

  return PaymentLinkTransaction;
};