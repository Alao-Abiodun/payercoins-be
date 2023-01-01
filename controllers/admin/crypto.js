const ejs = require("ejs");
path = require("path");
const { successResMsg } = require("../../utils/libs/response");
const AppError = require("../../utils/libs/appError");
const Rate = require("../../models/rateModel");
const catchAsync = require("../../utils/libs/catchAsync");
const LiveBox = require("../../crypto-module")("live");
const SandBox = require("../../crypto-module")("sandbox");
const ManuallyUpdatedDepositTransaction = require("../../models/manuallyUpdatedDepositTransaction");
const ManualCryptoWalletTransaction = require("../../models/manualCryptoWalletTransactionModel");
const User = require("../../models/userModel");
const Otp = require("../../models/otpModel");
const { generateToken } = require("../../utils/libs/gen-otp");
const sendEmail = require("../../utils/libs/email");

const update = async (req, res, next) => {
  try {
    const { currency, amount } = req.body;
    if (!currency) {
      return next(new AppError("Invalid parameter.", 401));
    }

    let owner = req.params.env;
    const rates = await Rate.findOne({ owner: owner });
    if (rates) {
      let s = { ...rates.rates, [currency]: amount };
      const new_rates = await Rate.updateOne(
        { owner: owner },
        {
          rates: s,
        }
      );
      if (!new_rates.n) {
        return next(new AppError("We are unable to update rates.", 401));
      }
      return successResMsg(res, 200, {
        message: `${currency} rate has been updated successfully`,
      });
    } else {
      let s = { [currency]: amount };
      await Rate.create({
        owner: owner,
        rates: s,
      });
      return successResMsg(res, 200, {
        message: `${currency} rate has been updated successfully`,
      });
    }
  } catch (err) {
    return next(new AppError(`We are unable to update rate: ${err}`, 401));
  }
};

const completeCryptoDepositTransaction = catchAsync(async (req, res, next) => {
  const { transactionId } = req.params;
  const { environment, transaction_type: transactionType } = req.body;

  if (environment === "live") {
    const paymentPageTransaction =
      await LiveBox.completeCryptoDepositTransaction(
        transactionId,
        transactionType
      );

    return successResMsg(res, 200, paymentPageTransaction);
  }

  const transactionresponse = await SandBox.completeCryptoDepositTransaction(
    transactionId,
    transactionType
  );

  if (transactionresponse.error) {
    return next(new AppError(transactionresponse.message, 400));
  }
  const dataInfo = transactionresponse;

  return successResMsg(res, 200, dataInfo);
});

const getAllManuallyCompletedDeposits = catchAsync(async (req, res) => {
  try {
    let page = Number(req.page);
    let limit = Number(req.limit);

    page = page && page >= 1 ? page : 1;
    limit = limit && limit > 1 ? limit : 10;

    const [manuallyCompletedDeposits, count] = await Promise.all([
      ManuallyUpdatedDepositTransaction.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      ManuallyUpdatedDepositTransaction.countDocuments(),
    ]);

    const dataInfo = {
      manuallyCompletedDeposits,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    console.log(error), new AppError("Server error, please try again later.");
  }
});

const initiateWalletDeposit = catchAsync(async (req, res, next) => {
  try {
    const { userEmail, cryptoSymbol, environment, amount } = req.body;

    const user = await User.findOne({ email: userEmail });

    // Throw error if user with the email is not found
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const { id: adminId, email: adminEmail } = req.user;

    // delete any previously generated OTP so the admin is not bound by the 5 mins restriction
    await Otp.deleteOne({ email: adminEmail });

    // Send OTP to the admin initiating the transaction
    const generatedToken = generateToken();

    // create the otp document
    await Otp.create({
      user: adminId,
      email: adminEmail,
      code: generatedToken,
      data: {
        cryptoSymbol,
        amount: amount,
        userId: user._id,
        userUuid: user.uuid,
        environment,
        adminId,
      },
    });

    if (process.env.NODE_ENV === "production") {
      ejs.renderFile(
        path.join(__dirname, "../../views/email-template.ejs"),
        {
          salutation: `Hello,`,
          body: `
                  Please use the OTP code below to confirm wallet deposit transaction you initiated from the admin dashboard.<br>
                  <h2>${generatedToken}</h2> 
                  <br>
                  This code expires in 5 minutes.
                  <br><br>
                  Ignore this mail, if you didn't initiate this transaction.
                  `,
        },
        async (err, data) => {
          //use the data here as the mail body
          const options = {
            email: adminEmail,
            subject: "Manual Wallet Deposit",
            message: data,
          };
          await sendEmail(options);
        }
      );
    }

    return successResMsg(res, 200, {
      message: "Verification token has been sent to your registered email",
    });
  } catch (error) {
    console.log(error), new AppError("Server error, please try again later.");
  }
});

const completeWalletDeposit = catchAsync(async (req, res, next) => {
  try {
    const { otp } = req.body;

    const otpData = await Otp.findOne({ code: otp });

    if (!otpData) {
      return next(new AppError("Invalid verification token", 400));
    }

    // Delete the OTP
    await Otp.deleteOne({ code: otp });

    const { cryptoSymbol, amount, userId, userUuid, environment, adminId } =
      otpData.data;

    let walletDeposit;
    if (environment === "live") {
      console.log("PROD");
      const crypto = await LiveBox.getCryptoBySymbol(cryptoSymbol);
      console.log("live", crypto);
      walletDeposit = await LiveBox.createWalletDeposit(
        amount,
        userUuid,
        crypto.id
      );
    } else {
      console.log("SANDBOX");
      const crypto = await SandBox.getCryptoBySymbol(cryptoSymbol);
      console.log("sandbox", crypto);
      walletDeposit = await SandBox.createWalletDeposit(
        amount,
        userUuid,
        crypto.id
      );

      if (walletDeposit.error) {
        return res.status(400).json({
          status: "error",
          message: walletDeposit.message,
        });
      }
    }

    // Create a record of the transaction
    await ManualCryptoWalletTransaction.create({
      amount,
      user: userId,
      transaction_id: walletDeposit.data.transactionId,
      previous_balance: walletDeposit.data.previousBalance,
      current_balance: walletDeposit.data.currentBalance,
      crypto_wallet_id: walletDeposit.data.cryptoWalletId,
      crypto_symbol: cryptoSymbol,
      initiated_by: adminId,
    });

    return successResMsg(res, 200, walletDeposit);
  } catch (error) {
    console.log(error), new AppError("Server error, please try again later.");
  }
});

module.exports = {
  updateRate: update,
  completeCryptoDepositTransaction,
  getAllManuallyCompletedDeposits,
  initiateWalletDeposit,
  completeWalletDeposit,
};
