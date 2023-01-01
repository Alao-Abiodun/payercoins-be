const cryptoRepository = require("../repositories/crypto");
const cryptoWalletTransactionRepository = require("../repositories/transaction");

module.exports = (configs, environment) => async () => {
  // load the database
  const database = require("../../database/models")({ environment });

  // get all crypto types
  const cryptos = await cryptoRepository.findAll(database);

  console.log("cryptos", cryptos);

  // get all transactions
  const transactions = await cryptoWalletTransactionRepository.findAll(
    database
  );

  console.log("transactions", transactions);

  let transaction_summary = {};

  //loop through crypto types to get their id
  cryptos.forEach((crypto) => {
    transaction_summary[crypto.symbol] = {
      amount: 0,
      count: 0,
    };
    transactions.forEach((tx) => {
      if (tx.cryptoId == crypto.id && tx.status == "successful") {
        transaction_summary[crypto.symbol].amount += parseFloat(tx.amount);
        transaction_summary[crypto.symbol].count += 1;
      }
    });
  });

  return transaction_summary;
};
