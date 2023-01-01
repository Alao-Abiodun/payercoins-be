"use strict";
module.exports = function (sequelize, DataTypes) {
  var PaymentLink = sequelize.define("PaymentLink", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    clientId: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    amountType: { type: DataTypes.STRING, allowNull: false },
    availableCrypto: { type: DataTypes.JSON, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    metaData: { type: DataTypes.JSON, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false }
  }, {
    classMethods: {},

    indexes: [
      { unique: true, fields: ['reference'] },
      { unique: true, fields: ['uuid'] },
    ],

    tableName: 'payment_links'
  });

  PaymentLink.associate = function (models) {
    // associations can be defined here
    PaymentLink.hasOne(models.PaymentLinkTransaction, { foreignKey: 'paymentLinkId', as: 'paymentLinkTransaction' })
  }

  return PaymentLink;
};