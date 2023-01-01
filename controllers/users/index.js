const mongoose = require("mongoose");
const catchAsync = require("../../utils/libs/catchAsync");
const AppError = require("../../utils/libs/appError");
const User = require("../../models/userModel");
const Settings = require("../../models/settingsModel");
const Business = require("../../models/businessModel");
const { successResMsg } = require("../../utils/libs/response");
const { cloudinaryUploadMethod } = require("../../utils/libs/cloudinaryUpload");
const key = require("../../utils/libs/gen-key");

exports.switchIndividualToBusiness = async (req, res, next) => {
  const { id } = req.params;

  const session = await mongoose.startSession(); // Start Session
  session.startTransaction(); // start Transaction

  try {
    const {
      businessName,
      businessIndustry,
      businessEmail,
      businessRole,
      businessURL,
      description,
      businessAddress,
    } = req.body;

    // validate req.body
    if (
      !businessName ||
      !businessIndustry ||
      !businessEmail ||
      !businessRole ||
      !businessURL ||
      !description ||
      !businessAddress
    ) {
      return next(new AppError("Please fill all the fields", 400));
    }

    const userData = await User.findById(id).select("+isBusiness");

    if (!userData) {
      return next(new AppError("User not found", 404));
    }

    // Check if user is already a business
    if (userData.isBusiness) {
      return next(new AppError("User is already a business", 400));
    }

    const { path } = req.file;

    const newPath = await cloudinaryUploadMethod(path);

    const uploadedFile = newPath.res;
    // console.log({uploadedFile});

    if (!uploadedFile) {
      return next(new AppError("upload file error", 400));
    }

    userData.userType = "business";
    userData.isBusiness = true;
    await userData.save();

    const newBusiness = await Business.create({
      businessName,
      businessIndustry,
      businessEmail,
      businessRole,
      businessURL,
      description,
      businessAddress,
      businessDocument: uploadedFile,
      user: userData,
    });

    const dataInfo = {
      message:
        "Your business document has been submitted successfully and in currently in progress. You will receive an email after being verified by the team.!",
    };

    await session.commitTransaction(); // comit Transaction
    session.endSession(); // end the Session

    return successResMsg(res, 201, dataInfo);
  } catch (error) {
    console.log(error); //TODO remove console.log
    await session.abortTransaction(); // abort transaction which is a rollback
    session.endSession(); // end the session
    return next(new AppError(error, error.status));
  }
};

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (user.userType === "business") {
    const business = await Business.findOne({ user: id });
    if (!business) return next(new AppError("business not found", 404));
    const data = { business };
    return successResMsg(res, 200, data);
  }
  if (!user) {
    return next(
      new AppError("User does not exist, do check the user id correctly", 404)
    );
  }

  const data = { user };
  return successResMsg(res, 200, data);
});

exports.updateUserImage = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { path } = req.file;

  const newPath = await cloudinaryUploadMethod(path);

  const uploadedImage = newPath.res;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      profileImage: uploadedImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError("Error Occured While Updating", 404));
  }

  if (updatedUser.userType === "business") {
    const business = await Business.findOne({ user: id });
    if (!business) return next(new AppError("business not found", 404));
    const data = { business };
    return successResMsg(res, 200, data);
  }

  const data = { user: updatedUser };
  return successResMsg(res, 200, data);
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExists = User.findById(id);

  if (!userExists)
    return next(
      new AppError("User does not exist, do check the user id correctly", 404)
    );

  if (req.body.phoneNumber) {
    const phoneNumberCheck = await User.exists({
      phoneNumber: req.body.phoneNumber,
    });

    if (phoneNumberCheck)
      return next(new AppError("Phone Number already exist", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new AppError("Update User failed", 404));
  }
  if (updatedUser.userType === "business") {
    const business = await Business.findOne({ user: id });
    if (!business) return next(new AppError("business not found", 404));
    const data = { business };
    return successResMsg(res, 200, data);
  }

  const data = { user: updatedUser };
  return successResMsg(res, 200, data);
});

exports.updateBusinessProfile = catchAsync(async (req, res, next) => {
  const businessExists = await Business.findById(req.body.businessId);

  if (!businessExists)
    return next(
      new AppError(
        "Business does not exist, do check the business id correctly",
        404
      )
    );

  const updatedBusiness = await Business.findByIdAndUpdate(
    req.body.businessId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedBusiness) {
    return next(new AppError("Business Update failed", 404));
  }
  const data = { business: updatedBusiness };
  return successResMsg(res, 200, data);
});

exports.getEnvironmentalKeys = catchAsync(async (req, res, next) => {
  try {
    if (req.api_keys && !req.query.reload) {
      return successResMsg(res, 200, req.api_keys);
    }
    let api_keys = {
      live_keys: {
        public_key: "PYC-PUB_" + key(11),
        secret_key: "PYC-SEC_" + key(11),
      },
      test_keys: {
        public_key: "PYC-PUB_" + key(11) + "_TEST",
        secret_key: "PYC-SEC_" + key(11) + "_TEST",
      },
    };

    let keys = { ...api_keys };

    const keys_update = await Settings.updateOne(
      { user: req.user._id },
      {
        api_keys: keys,
      }
    );

    if (!keys_update.n) {
      return next(
        new AppError(
          "We are unable generate your api keys, kindly try again",
          401
        )
      );
    }

    return successResMsg(res, 200, keys);
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        "We are unable to fetch your api keys at the moment, kindly check back later",
        400
      )
    );
  }
});

exports.getCallbackUrl = catchAsync(async (req, res, next) => {
  try {
    return successResMsg(res, 200, { callback_url: req.callback_url });
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        "We are unable to fetch callback_url at the moment, kindly try again later",
        400
      )
    );
  }
});

exports.updateCallbackUrl = catchAsync(async (req, res, next) => {
  try {
    let { live, test } = req.body;

    if (!live && !test) {
      return next(new AppError("Invalid parameter", 401));
    }

    if (!live) {
      if (!req.callback_url.live) {
        live = "";
      } else {
        live = req.callback_url.live;
      }
    }

    if (!test) {
      if (!req.callback_url.test) {
        test = "";
      } else {
        test = req.callback_url.test;
      }
    }

    const callbackUrl_update = await Settings.updateOne(
      { user: req.user._id },
      {
        callback_url: { live: live, test: test },
      }
    );

    if (!callbackUrl_update.n) {
      return next(
        new AppError(
          "We are unable to update your callback_url, kindly try again",
          401
        )
      );
    }

    return successResMsg(res, 200, {
      message: "Your callback_url has been updated successfully",
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        "We are unable to update your callback_url, kindly check back later",
        400
      )
    );
  }
});

exports.getTransactionFeePreference = async (req, res, next) => {
  try {
    const user_settings = await Settings.findOne({ user: req.user._id });
    if (!user_settings) {
      throw new Error("User transaction preference has not been set");
    }
    return successResMsg(res, 200, {
      preference: user_settings.transaction_fees_preference,
    });
  } catch (err) {
    return next(
      new AppError("We are unable to get your transaction fee preference", 400)
    );
  }
};

exports.updateTransactionFeePreference = async (req, res, next) => {
  try {
    const { preference } = req.body;
    if (!preference) throw new Error("New transaction preference is required");

    const settings = await Settings.updateOne(
      { user: req.user._id },
      {
        transaction_fees_preference: preference,
      }
    );
    if (!settings.n) {
      throw new Error(
        "We are unable to update your transaction fee preference"
      );
    }
    return successResMsg(res, 200, {
      message: "Your transaction fee preference has been updated",
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError("We are unable to get your transaction preference", 400)
    );
  }
};

exports.addSettlementPreference = async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!type) throw new Error("Settlement type is required");
    const settlements = req.settlements;
    if (type === "bank") {
      const { account_number, account_name, bank_name, bank_code } = req.body;
      if (!account_number && !account_name && !bank_name && !bank_code) {
        return next(new AppError("Invalid parameter", 401));
      }

      let s = {
        ...settlements,
        bank: { account_number, account_name, bank_name, bank_code },
      };

      const new_settlements = await Settings.updateOne(
        { user: req.user._id },
        {
          settlements: s,
        }
      );

      if (!new_settlements.n) {
        return next(
          new AppError(
            "We are unable to add your new settlement preference",
            401
          )
        );
      }

      return successResMsg(res, 200, {
        message: `Settlement for ${type} has been added successfully`,
      });
    } else {
      const { wallet_symbol, wallet_slug, wallet_address, memo } = req.body;
      if (!wallet_symbol || !wallet_slug || !wallet_address)
        throw new Error("Invalid parameter");

      let verifyAddress = await req.cryptoBox.verifyCryptoAddress(
        wallet_address,
        wallet_symbol
      );
      if (!verifyAddress) throw new Error("Invalid wallet address");

      let s = {
        ...settlements,
        [wallet_symbol]: { wallet_slug, wallet_address, memo },
      };

      const new_settlements = await Settings.updateOne(
        { user: req.user._id },
        {
          settlements: s,
        }
      );

      if (!new_settlements.n) {
        return next(
          new AppError(
            "We are unable to add your new settlement preference",
            401
          )
        );
      }
      return successResMsg(res, 200, {
        message: `Settlement for ${wallet_symbol} has been added successfully`,
      });
    }
  } catch (err) {
    // console.log(err);
    return next(new AppError(`${err}`, 401));
  }
};

exports.getSettlementPreference = async (req, res, next) => {
  try {
    const settlements = req.settlements;
    return successResMsg(res, 200, {
      settlements,
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        `We are unable to get your settlement preference: ${err}`,
        401
      )
    );
  }
};

exports.deleteSettlementPreference = async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!type) throw new Error("Settlement type is required");
    const settlements = req.settlements;
    if (type === "bank") {
      delete settlements["bank"];

      const new_settlements = await Settings.updateOne(
        { user: req.user._id },
        {
          settlements: settlements,
        }
      );

      if (!new_settlements.n)
        throw new Error(
          "We are unable to deleted your new settlement preference"
        );

      return successResMsg(res, 200, {
        message: `Settlement for ${type} has been deleted successfully`,
      });
    } else {
      const { wallet_symbol } = req.body;
      if (!wallet_symbol) throw new Error("Invalid parameter");

      delete settlements[wallet_symbol];

      const new_settlements = await Settings.updateOne(
        { user: req.user._id },
        {
          settlements: settlements,
        }
      );

      if (!new_settlements.n)
        throw new Error(
          "We are unable to delete your new settlement preference"
        );
      return successResMsg(res, 200, {
        message: `Settlement for ${wallet_symbol} has been deleted successfully`,
      });
    }
  } catch (err) {
    console.log(err);
    return next(new AppError(`${err}`, 401));
  }
};

exports.getKeys = catchAsync(async (req, res, next) => {
  const { PAYERCOINS_ACCESS_TOKEN_SECRET } = process.env;

  const data = { key: PAYERCOINS_ACCESS_TOKEN_SECRET };

  return successResMsg(res, 200, data);
});
