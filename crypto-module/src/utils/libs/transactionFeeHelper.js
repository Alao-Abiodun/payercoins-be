const { availableCryptoSymbol, cryptoSmallestUnits } = require("../enums");
require("../../../config/index");

const transactionFeeHelper = (transactionFee, cryptoSymbol) => {
  switch (cryptoSymbol) {
    case availableCryptoSymbol.btc:
      const btcBytePerTransaction = process.env.BTC_BYTE_PER_TRANSACTION;
      return +(
        (transactionFee * +btcBytePerTransaction) /
        cryptoSmallestUnits.btc
      ).toFixed(10);
    case availableCryptoSymbol.eth:
      const ethGasLimit = process.env.ETH_GAS_LIMIT;
      return +(
        (transactionFee * +ethGasLimit) /
        cryptoSmallestUnits.eth
      ).toFixed(10);
  }
};

module.exports = transactionFeeHelper;
