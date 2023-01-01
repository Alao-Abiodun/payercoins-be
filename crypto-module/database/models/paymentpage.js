"use strict";
module.exports = function (sequelize, DataTypes) {
  var PaymentPage = sequelize.define("PaymentPage", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    clientId: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    amountType: { type: DataTypes.STRING, allowNull: false },
    availableCrypto: { type: DataTypes.JSON, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    metaData: { type: DataTypes.JSON, allowNull: false },
  }, {
    classMethods: {},

    indexes: [
      { unique: true, fields: ['reference'] },
      { unique: true, fields: ['uuid'] },
    ],

    tableName: 'payment_pages'
  });

  PaymentPage.associate = function (models) {
    // associations can be defined here
    PaymentPage.hasMany(models.PaymentPageTransaction, { foreignKey: 'paymentPageId', as: 'paymentPageTransactions' })
  }

  return PaymentPage;
};