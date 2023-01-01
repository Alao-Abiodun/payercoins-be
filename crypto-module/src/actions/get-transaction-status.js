const WalletTransactionRepository = require("../repositories/wallet-transaction");

module.exports = (configs, environment) => async (transactionUuid) => {
  // load the database
  const database = require("../../database/models")({ environment });

  //console.log(environment, 'ENVIRONMENT')

  const transaction =
    await WalletTransactionRepository.findCryptoWalletTransactionWithUuid(
      database,
      transactionUuid
    );

  // console.log(transaction, 'Crypto transaction')

  // Return a falsy value if transaction is not found
  if (!transaction) {
    return false;
  }

  // Return status of the transaction
  return transaction.status;
};
