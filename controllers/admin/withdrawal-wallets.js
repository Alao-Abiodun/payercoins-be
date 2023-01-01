const ejs = require("ejs");
const { successResMsg } = require("../../utils/libs/response");
const AppError = require("../../utils/libs/appError");
const Withdrawal_wallets = require("../../models/withdrawalWalletsModel");
const { generateToken } = require("../../utils/libs/gen-otp");
const Otp = require("../../models/otpModel");
require("dotenv").config();

const get = async (req, res, next) => {
  try {
    let owner = req.params.env;
    const { wallets } = await Withdrawal_wallets.findOne({ owner: owner });
    return successResMsg(res, 200, {
      wallets,
    });
  } catch (err) {
    //console.log(err);
    return next(
      new AppError(
        `We are unable to get withdrawal wallet preference: ${err}`,
        401
      )
    );
  }
};

const initiateWalletAddressUpdate = async (req, res, next) => {
  try {
    const { wallet_symbol, wallet_slug, wallet_address, memo } = req.body;
    if (!wallet_symbol || !wallet_slug || !wallet_address) {
      console.log(req.body);
      return next(new AppError("Invalid parameter", 401));
    }
    let owner = req.params.env;
    const wallets = await Withdrawal_wallets.findOne({ owner: owner });
    if (wallets) {
      // Send OTP to the admin initiating the update
      const generatedToken = generateToken();
      const { email: adminEmail } = req.user;
      // create the otp document
      await Otp.create({
        email: adminEmail,
        code: generatedToken,
        data: {
          wallet_symbol,
          wallet_slug,
          wallet_address,
          memo: memo,
          environment: owner,
        },
      });
      if (process.env.NODE_ENV === "production") {
        ejs.renderFile(
          path.join(__dirname, "../../views/email-template.ejs"),
          {
            salutation: `Hello,`,
            body: `
                    Please use the OTP code below to confirm a change in withdrawal wallet you initiated from the admin dashboard.<br>
                    <h2>${generatedToken}</h2>
                    <br>
                    This code expires in 5 minutes.
                    <br><br>
                    Ignore this mail, if you didn't initiate this action.
                    `,
          },
          async (err, data) => {
            //use the data here as the mail body
            const options = {
              email: adminEmail,
              subject: "Withdrawal Wallet Update",
              message: data,
            };
            await sendEmail(options);
          }
        );
      }
      return successResMsg(res, 200, {
        message: "Verification token has been sent to your registered email",
      });
    } else {
      return next(
        new AppError(`Withdrawal wallets for ${owner} not found`, 401)
      );
    }
  } catch (err) {
    return next(
      new AppError(
        `We are unable to initiate withdrawal wallet update: ${err}`,
        401
      )
    );
  }
};

const processUpdate = async (req, res, next) => {
  console.log("Process Update >>>>>>>>>>>>>>> withdrawal wallet for the admin");
  try {
    const { otp } = req.body;
    const owner = req.params.env;

    const otpData = await Otp.findOne({ code: otp });

    if (!otpData) {
      return next(new AppError("Invalid verification token", 400));
    }

    // Delete the OTP
    await Otp.deleteOne({ code: otp });

    const { wallet_symbol, wallet_slug, wallet_address, memo, environment } =
      otpData.data;

    const wallets = await Withdrawal_wallets.findOne({ owner: environment });

    if (wallets) {
      let s = {
        ...wallets.wallets,
        [wallet_symbol]: { wallet_slug, wallet_address, memo },
      };
      const new_wallets = await Withdrawal_wallets.updateOne(
        { owner: owner },
        {
          wallets: s,
        }
      );
      if (!new_wallets.n) {
        return next(
          new AppError(
            "We are unable to update withdrawal wallet preference, please try again later.",
            401
          )
        );
      }
      return successResMsg(res, 200, {
        message: `Withdrawal wallet preference for ${wallet_symbol} has been updated successfully`,
      });
    } else {
      let s = { [wallet_symbol]: { wallet_slug, wallet_address, memo } };
      await Withdrawal_wallets.create({
        owner: owner,
        wallets: s,
      });
      return successResMsg(res, 200, {
        message: `Withdrawal wallet preference for ${wallet_symbol} has been updated successfully`,
      });
    }
  } catch (err) {
    console.log(err);
    next(new AppError(`${err}`, 401));
  }
};

module.exports = {
  get,
  initiateWalletAddressUpdate,
  processUpdate,
};
