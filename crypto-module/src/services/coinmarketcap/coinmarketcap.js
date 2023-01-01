const axios = require('axios').default;

module.exports = (configs, environment) => {
    return async (cryptosArray, currenciesArray) => {

        const api = configs[environment].url;
        const apiKey = configs[environment].apiKey;

        const url = `${api}/v1/cryptocurrency/quotes/latest?symbol=${cryptosArray.join(',')}&convert=${currenciesArray.join(',')}`;
        try {
            const response = await axios.get(url, { headers: { 'X-CMC_PRO_API_KEY': apiKey } });

            if (response.status === 200) {
                return { status: true, rate: response.data.data };
            }
            else {
                return { status: false, error: '' };
            }
        } catch (error) {
            console.log(error);
            return { status: false, error: error.response.data.message };
        }
    }
};