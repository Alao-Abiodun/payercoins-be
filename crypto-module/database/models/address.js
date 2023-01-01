"use strict";
module.exports = function (sequelize, DataTypes) {
  var Address = sequelize.define("Address", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    cryptoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'cryptos', key: 'id' } },
    addressableType: { type: DataTypes.STRING, allowNull: false },
    addressableId: { type: DataTypes.INTEGER, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    memo: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    classMethods: {},

    indexes: [
      { fields: ['address'] },
      { fields: ['cryptoId'] },
      { unique: true, fields: ['uuid'] },
      { unique: false, fields: ['addressableId'] },
      { fields: ['addressableType', 'addressableId'] },
    ],

    tableName: 'addresses'
  });

  Address.associate = function (models) {
    // associations can be defined here
    Address.belongsTo(models.Crypto, { foreignKey: 'cryptoId' })
    Address.belongsTo(models.PaymentLinkTransaction, { foreignKey: 'addressableId', as: 'paymentLinkTransaction', constraints: false });
    Address.belongsTo(models.PaymentPageTransaction, { foreignKey: 'addressableId', as: 'paymentPageTransaction', constraints: false });
    Address.belongsTo(models.CryptoWallet, { foreignKey: 'addressableId', as: 'cryptoWallet', constraints: false });

    // Address.addHook("afterFind", findResult => {
    //   if (!Array.isArray(findResult)) findResult = [findResult];
    //   for (const instance of findResult) {
    //     if (instance.addressableType === "wallet" && instance.wallet !== undefined) {
    //       instance.addressable = instance.wallet;
    //     } else if (instance.addressableType === "link" && instance.link !== undefined) {
    //       instance.addressable = instance.link;
    //     }
    //     // To prevent mistakes:
    //     delete instance.wallet;
    //     delete instance.dataValues.wallet;
    //     delete instance.link;
    //     delete instance.dataValues.link;
    //   }
    // });
  }

  return Address;
};