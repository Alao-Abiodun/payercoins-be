const coinmarketcap = require('../services/coinmarketcap/coinmarketcap');
const cryptoRepository = require('../repositories/crypto');
const getTransactionFee = require('../services/treshold/transactionFee');
const formatCoinmarketcapRateResponse = require('../utils/coinmarketcap');
const transactionFeeHelper = require('../utils/libs/transactionFeeHelper');
const { availableCryptoSymbol } = require('../utils/enums');

module.exports = (configs, environment) => async (req, res) => {
  const { crypto: cryptoSymbol } = req.query;

  if (!cryptoSymbol || typeof cryptoSymbol !== 'string') {
    return res
      .status(422)
      .json({ message: 'crypto is required and must be a string' });
  }

  const database = require('../../database/models')({ environment });

  try {
    // get all crypto types
  const cryptos = await cryptoRepository.findAll(database);

  // Check the crypto selected by the user against the crypto DB
  const internallyMatchedCrypto = cryptos.find(crypto => crypto.symbol === cryptoSymbol);

  if (!internallyMatchedCrypto) {
    return res.status(400).json({ message: 'Invalid crypto coin selected, kindly check your request and try again.' })
  }

  let totalTransactionFee;

  let payercoinTransactionFee = 0.0; // 0 USD

  if (
    cryptoSymbol !== availableCryptoSymbol.btc &&
    cryptoSymbol !== availableCryptoSymbol.eth
  ) {
    totalTransactionFee = payercoinTransactionFee;
  } else {

    const { status, data: transactionFee } = await getTransactionFee(
      configs.treshold,
      environment
    )(cryptoSymbol);
  
    if (!status) {
      throw new Error(
        'Sorry, gas fee service is unavailable at the moment, please try again later.'
      );
    }
  
    // Get the actual coin transaction fee
    const actualTransactionFee = transactionFeeHelper(transactionFee, cryptoSymbol);

    const cryptoRates = await coinmarketcap(configs.coinmarketcap, environment)(
      cryptoSymbol.split(','),
      'USD'.split(',')
    );

    if (!cryptoRates.status) {
      return res.status(500).json({
        message:
          'Sorry, gas fee service is unavailable at the moment, please try again later.',
      });
    }

    const rate = await formatCoinmarketcapRateResponse(cryptoRates.rate);

    // Get 1 USD value of the coin being withdrawn
    payercoinTransactionFee = payercoinTransactionFee / rate[cryptoSymbol].USD;
    totalTransactionFee = actualTransactionFee + payercoinTransactionFee;
  }

  return res
    .status(200)
    .json({ message: 'Transaction fee', totalTransactionFee });
  } catch(error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
};
