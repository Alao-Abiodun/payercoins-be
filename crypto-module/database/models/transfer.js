"use strict";
module.exports = function (sequelize, DataTypes) {
  var Transfer = sequelize.define("Transfer", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    cryptoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'cryptos', key: 'id' } },
    transferableType: { type: DataTypes.STRING, allowNull: false },
    transferableId: { type: DataTypes.INTEGER, allowNull: false },
    txId: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    fee: { type: DataTypes.DECIMAL(45, 25), allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    memo: { type: DataTypes.TEXT, allowNull: true },
  }, {
    classMethods: {},

    indexes: [
      { fields: ['txId'] },
      { fields: ['cryptoId'] },
      { unique: true, fields: ['uuid'] },
      { unique: false, fields: ['address'] },
      { unique: false, fields: ['transferableId'] },
      { fields: ['transferableType', 'transferableId'] },
    ],

    tableName: 'transfers'
  });

  Transfer.associate = function (models) {
    // associations can be defined here
    Transfer.belongsTo(models.Crypto, { foreignKey: 'cryptoId' })
    Transfer.belongsTo(models.PaymentLinkTransaction, { foreignKey: 'transferableId', as: 'paymentLinkTransaction', constraints: false });
    Transfer.belongsTo(models.PaymentPageTransaction, { foreignKey: 'transferableId', as: 'paymentPageTransaction', constraints: false });
    Transfer.belongsTo(models.CryptoWalletTransaction, { foreignKey: 'transferableId', as: 'cryptoWalletTransaction', constraints: false });

    // Transfer.addHook("afterFind", findResult => {
    //   console.log(findResult);
    //   if (!Array.isArray(findResult)) findResult = [findResult];
    //   for (const instance of findResult) {
    //     if (instance.transferableType === "wallet" && instance.wallet !== undefined) {
    //       instance.transferable = instance.wallet;
    //     } else if (instance.transferableType === "link" && instance.link !== undefined) {
    //       instance.transferable = instance.link;
    //     }
    //     // To prevent mistakes:
    //     delete instance.wallet;
    //     delete instance.dataValues.wallet;
    //     delete instance.link;
    //     delete instance.dataValues.link;
    //   }
    // });
  }

  return Transfer;
};