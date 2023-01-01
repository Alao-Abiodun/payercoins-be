const axios = require('axios').default;

module.exports = (configs, environment) => {
    return async (cryptoSymbol, address) => {

        const crypto = configs[environment][cryptoSymbol];
        const parentCrypto = crypto.parentSymbol;

        const generateAddressCrypto = configs[environment][parentCrypto];

        const api = configs[environment].url;

        const { getRequestDetails, randomString } = require('./request-functions');

        const pre_url = `${api}/v1/sofa/wallets/${generateAddressCrypto.cold.walletId}/addresses/verify`;

        const postData = {
            addresses: [
                address
            ]
        };

        const { url, headers } = getRequestDetails(pre_url, generateAddressCrypto.cold.secret, generateAddressCrypto.cold.key, postData);

        // make async post request with axios

        try {
            const response = await axios.post(url, postData, { headers });

            if (response.status === 200) {
                return { status: true, address: response.data.result[0].valid };
            }
            else {
                return { status: false, error: '' };
            }
        } catch (error) {
            return { status: false, error: error.response.data.message };
        }
    }
};