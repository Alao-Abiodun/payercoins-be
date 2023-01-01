const axiosCall = require("./axiosCall");
require("dotenv").config();

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.fincra.com"
    : "https://sandboxapi.fincra.com";

const headers = {
  'api-key': process.env.PAYERCOINS_FINCRA_API_KEY,
}

const initiateFincraPayout = async (transferData) => {
  try {
    const transferResult = await axiosCall({
      method: "post",
      url: `${baseUrl}/disbursements/payouts`,
      data: transferData,
      headers
    });

    return transferResult;
  } catch (error) {
    console.log(error, 'ERROR');
  }
};

const getBusinessId = async () => {
  console.log(process.env.PAYERCOINS_FINCRA_API_KEY, baseUrl)
  try {
    const fincraBusinessInformation = await axiosCall({
      method: "get",
      url: `${baseUrl}/profile/merchants/me`,
      data: {},
    });
    return fincraBusinessInformation;
  } catch (error) {
    console.log(error, 'ERROR');
  }
};

module.exports = {
  initiateFincraPayout,
  getBusinessId,
};
