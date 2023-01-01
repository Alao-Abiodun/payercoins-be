const { getRate } = require('../../../../controllers/admin/helper');

const formatCoinmarketcapRateResponse = async (ratesFromCoinmarketCap, env='live') => {
  let rates = {};

  let ngn_rate = await getRate(env);

  for (const property in ratesFromCoinmarketCap) {
    rates[property] = {};

    for (const key in ratesFromCoinmarketCap[property].quote) {
      rates[property][key] = ratesFromCoinmarketCap[property].quote[key].price;
      rates[property]['NGN'] = ratesFromCoinmarketCap[property].quote[key].price * parseFloat(ngn_rate);
    }
  }

  return rates;
};

module.exports = formatCoinmarketcapRateResponse;
