const axios = require('axios').default;

module.exports = (configs, environment) => {
    return async (cryptoSymbol, label) => {

        const crypto = configs[environment][cryptoSymbol];
        const parentCrypto = crypto.parentSymbol;

        const generateAddressCrypto = configs[environment][parentCrypto];

        const api = configs[environment].url;

        const { getRequestDetails, randomString } = require('./request-functions');

        const pre_url = `${api}/v1/sofa/wallets/${generateAddressCrypto.cold.walletId}/addresses`;
        const postData = {
            count: 1,
            labels: [
                label
            ]
        };

        // check is crypto uses memo for generating address
        const memo = generateAddressCrypto.memo;
        let memoString = null;
        if (memo) {
            memoString = randomString(memo);
            postData.memo = [memoString];
        }

        const { url, headers } = getRequestDetails(pre_url, generateAddressCrypto.cold.secret, generateAddressCrypto.cold.key, postData);

        // make async post request with axios

        try {
            const response = await axios.post(url, postData, { headers });

            if (response.status === 200) {
                return { status: true, address: response.data.addresses[0],  memo: memo ? memoString : null };
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