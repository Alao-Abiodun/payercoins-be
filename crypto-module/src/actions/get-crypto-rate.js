const coinmarketcap = require('../services/coinmarketcap/coinmarketcap');
const formatCoinmarketcapRateResponse = require('../utils/coinmarketcap');

module.exports = (configs, environment) => async (req, res, next) => {

    const { cryptos } = req.query;

    if (!cryptos || typeof cryptos !== 'string') {
        return res.status(422).json({ message: 'cryptos is required and must be a string' });
    }

    // if (!currencies || typeof currencies !== 'string') {
    //     return res.status(422).json({ message: 'currencies is required and must be a string' });
    // }

    const rateResonse = await coinmarketcap(configs.coinmarketcap, environment)(cryptos.split(','), ['USD']);

    if(!rateResonse.status) 
    {
        return res.status(500).json({ message: 'rates are down at the moment, try again' });
    }

    const rates = await formatCoinmarketcapRateResponse(rateResonse.rate, environment);

    return res.status(200).json({ message: 'rates retrieved successfully', rates});
}