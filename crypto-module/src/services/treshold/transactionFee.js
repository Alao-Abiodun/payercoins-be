const axios = require("axios").default;
const { getRequestDetails } = require("./request-functions");

module.exports =
  (configs, environment) =>
  async (cryptoSymbol) => {
    const crypto = configs[environment][cryptoSymbol];
    const api = configs[environment].url;

    const pre_url = `${api}/v1/sofa/wallets/${crypto.hot.walletId}/autofee`;

    const postData = { block_num: 1 };

    const { url, headers } = getRequestDetails(
      pre_url,
      crypto.hot.secret,
      crypto.hot.key,
      postData
    );

    // make async post request with axios

    try {
      const response = await axios.post(url, postData, { headers });

      if (response.status === 200) {
        return { status: true, data: response.data.auto_fee };
      } else {
        return { status: false, error: "" };
      }
    } catch (error) {
      //console.log(error);
      return { status: false, error: error.response.data.message };
    }
  };
