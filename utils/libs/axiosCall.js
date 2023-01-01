const axios = require('axios');

const axiosCall = async ({ method, url, data, headers }) => {

  try {
    const urlResponse = await axios({
      method: method || 'get',
      url,
      data,
      headers
    });

    return urlResponse.data;

  } catch (err) {
    
    const error = {
      status: err.response.status,
      message: err.response.statusText,
      ...err.response.data,
    }

    return error
  }
}

module.exports = axiosCall;
