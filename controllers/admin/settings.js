const { successResMsg } = require("../../utils/libs/response");
const AppError = require("../../utils/libs/appError");
const FiatWithdrawalSettings = require("../../models/fiatWithdrawalSettingsModel");

const updateFiatWithdrawalProvider = async (req, res) => {
  try {
    const { provider_to_use } = req.body;

    const fiatWithdrawalSettings = await FiatWithdrawalSettings.find();

    if (fiatWithdrawalSettings.length === 0) {
      await FiatWithdrawalSettings.create({ provider_to_use });
      return successResMsg(res, 200, {
        message: `Fiat withdrawal provider updated successfully`,
      });
    }

    await FiatWithdrawalSettings.updateOne(fiatWithdrawalSettings._id, { provider_to_use });

    return successResMsg(res, 200, {
      message: `Fiat withdrawal provider updated successfully`,
    });
  } catch (err) {
    return new AppError(
      `An unexpected error occured while updating fiat withdrawal settings ${err}`,
      500
    );
  }
};

const getFiatWithdrawalProvider = async (req, res) => {
  try {

    const currentWithdrawalSettingsawait = await  FiatWithdrawalSettings.find();

    return successResMsg(res, 200, {
      message: `Fiat withdrawal provider`,
      data: currentWithdrawalSettingsawait,
    });
  } catch (err) {
    return new AppError(
      `An unexpected error occured while getting fiat withdrawal settings ${err}`,
      500
    );
  }
};

module.exports = { updateFiatWithdrawalProvider, getFiatWithdrawalProvider };
