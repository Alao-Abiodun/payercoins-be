const addressService = require('../services/treshold/verify-address');

module.exports = (configs, environment) => async (address, symbol) => {

    // validate address and symbol is present
    if (!address || !symbol) {
        throw new Error('Address and symbol is required');
    }

    // verify address
    const response = await addressService(configs.treshold, environment)(symbol, address);

    if (!response.status) {
        throw new Error('Address verification service is down at the moment, try again');
    }

    if(!response.address)
    {
        throw new Error(`Invalid crypto address: ${address}`);
    }

    return response;

}