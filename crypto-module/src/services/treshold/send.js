const axios = require('axios').default;

module.exports = (configs, environment) => {
    return async (cryptoSymbol, address, amount, uuid, clientId, memo = null) => {

        const crypto = configs[environment][cryptoSymbol];
        const api = configs[environment].url;

        const { getRequestDetails, randomString } = require('./request-functions');

        const pre_url = `${api}/v1/sofa/wallets/${crypto.hot.walletId}/sender/transactions`;
        const postData = {requests: [{
            order_id: crypto.hot.prefix + uuid,
            address: address,
            amount: "" + amount + "",
            user_id: clientId
        }]};

        if (memo) {
            postData.memo = memo;
        }
        //console.log(crypto, postData);
        const { url, headers } = getRequestDetails(pre_url, crypto.hot.secret, crypto.hot.key, postData);

        // make async post request with axios

        try {
            const response = await axios.post(url, postData, { headers });
            console.log(response);

            if (response.status === 200) {
                return { status: true, id: crypto.hot.prefix + uuid };
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