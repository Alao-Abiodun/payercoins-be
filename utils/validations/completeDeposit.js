const Joi = require('joi');

const completeDepositTransaction = Joi.object()
  .options({ abortEarly: false })
  .keys({
    transaction_type: Joi.string().valid('page-deposit', 'wallet-deposit', 'link-deposit').required(),
    environment: Joi.string().valid('live', 'sandbox').required()
  });

  const initiateWalletDepositTransaction = Joi.object()
  .options({ abortEarly: false })
  .keys({
    amount: Joi.string().required(),
    cryptoSymbol: Joi.string().required(),
    userEmail: Joi.string().email().required(),
    environment: Joi.string().valid('live', 'sandbox').required(),
  });

  const verifyWalletDeposit = Joi.object()
  .options({ abortEarly: false })
  .keys({
    otp: Joi.string().required(),
  });

module.exports = {
  completeDepositTransaction,
  initiateWalletDepositTransaction,
  verifyWalletDeposit,
};
