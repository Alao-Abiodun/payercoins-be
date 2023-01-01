const axios = require('axios').default;
const { getRequestDetails } = require('./request-functions');

module.exports = (configs, environment) => {
    return async (cryptoSymbol, type, identifier, vout = 0, isOrderId=false) => {

        const crypto = configs[environment][cryptoSymbol];
        const api = configs[environment].url;

        const pre_url = type === 'deposit' ? 
            `${api}/v1/sofa/wallets/${crypto.cold.walletId}/receiver/notifications/txid/${identifier}/${vout}` :
            `${api}/v1/sofa/wallets/${crypto.hot.walletId}/sender/notifications/${isOrderId ? 'order_id':'txid'}/${identifier}`;

        const walletType = type === 'deposit' ? 'cold' : 'hot';

        const { url, headers } = getRequestDetails(pre_url, crypto[walletType].secret, crypto[walletType].key, null);

        // make async post request with axios

        try {
            const response = await axios.get(url, { headers });

            if(response.status === 200) 
            {
                return { status: true, data: response.data.notification};
            }
            else
            {
                return { status: false, error: ''};
            }
        } catch (error) {
            //console.log(error);
            return { status: false, error: error.response.data.message };
        }
    }
};