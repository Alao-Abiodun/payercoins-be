const crypto = require("crypto");
const ejs = require("ejs"),
  path = require("path"),
  QRCode = require("qrcode");
WithdrawalRequest = require("../../models/withdrawalRequestModel");
const catchAsync = require("../../utils/libs/catchAsync");
const AppError = require("../../utils/libs/appError");
const User = require("../../models/userModel");
const PaymentLink = require("../../models/paymentLinkModel");
const { successResMsg } = require("../../utils/libs/response");
const LiveBox = require("../../crypto-module")("live");
const SandBox = require("../../crypto-module")("sandbox");
const createPaymentSlug = require("../../utils/libs/createPaymentSlug");
const sendEmail = require("../../utils/libs/email");

exports.createPaymentLink = catchAsync(async (req, res, next) => {
  try {
    let amountType, amountAccepted;

    const { pageName, description, currency, isAmountFixed, amount } = req.body;
    if (!currency) {
      return next(new AppError("Please provide currency", 400));
    }

    if (isAmountFixed === true) {
      amountType = "fixed";
      amountAccepted = amount;
    } else {
      amountType = "custom";
      amountAccepted = 0;
    }

    const { link, details } = await req.cryptoBox.generatePaymentPage(
      req.user.uuid,
      currency,
      amountAccepted,
      amountType,
      { description: description, name: pageName }
    );

    const newPaymentLink = await PaymentLink.create({
      user: req.user._id,
      pageName,
      amount: amountAccepted,
      paymentSlug: await createPaymentSlug(pageName),
      paymentReference: details.reference,
      environment: req.environment,
    });

    const dataInfo = { paymentlink: newPaymentLink };

    return successResMsg(res, 201, dataInfo);
  } catch (err) {
    console.log(err.message);
    return next(new AppError(err, 400));
  }
});

exports.getPaymentLinkWithSlug = catchAsync(async (req, res, next) => {
  try {
    const { paymentlink } = req.params;

    const paymentLink = await PaymentLink.findOne({ paymentSlug: paymentlink })
      .select("+isDisabled")
      .populate("user", "-password");

    if (!paymentLink) {
      return next(new AppError("Payment Link not found", 404));
    }

    if (paymentLink.isDisabled) {
      return next(new AppError("Payment Link has been disabled", 400));
    }

    if (paymentLink.environment === "live") {
      const { details } = await LiveBox.getPaymentPage(
        paymentLink.paymentReference
      );

      const dataInfo = { paymentlink: paymentLink, paymentPage: details };

      return successResMsg(res, 200, dataInfo);
    } else {
      const { details } = await SandBox.getPaymentPage(
        paymentLink.paymentReference
      );

      const dataInfo = { paymentlink: paymentLink, paymentPage: details };
      return successResMsg(res, 200, dataInfo);
    }
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getPaymentLinkWithId = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    const paymentLink = await PaymentLink.findById(id).select("+isDisabled");

    if (!paymentLink) {
      return next(new AppError("Payment Link not found", 404));
    }

    const { details } = await req.cryptoBox.getPaymentPage(
      paymentLink.paymentReference
    );

    const dataInfo = { paymentlink: paymentLink, paymentPage: details };

    return successResMsg(res, 200, dataInfo);
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getUserPaymentLinks = catchAsync(async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { id } = req.params;

    let paymentLinks = await PaymentLink.find({
      user: id,
      environment: req.environment,
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 })
      .exec();

    // get total documents in the collection
    const count = await PaymentLink.countDocuments({
      user: id,
      environment: req.environment,
    });

    if (!paymentLinks)
      return successResMsg(res, 200, { message: "No Payment Link" });

    const dataInfo = {
      paymentLinks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
    return successResMsg(res, 200, dataInfo);
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

/*exports.updatePaymentLink = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentLink = await PaymentLink.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!paymentLink) {
      return next(new AppError('Payment Link with ID not found', 404));
    }

    return successResMsg(res, 200, { dataInfo: paymentLink });
  } catch(err) {
    return next(new AppError(err, 400));
  }
})*/

exports.disablePaymentLink = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentLink = await PaymentLink.findByIdAndUpdate(
      id,
      { isDisabled: true },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!paymentLink) {
      return next(new AppError("Payment Link with ID not found", 404));
    }

    return successResMsg(res, 200, {
      message: "Payment Link disabled successfully",
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.enablePaymentLink = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentLink = await PaymentLink.findByIdAndUpdate(
      id,
      { isDisabled: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!paymentLink) {
      return next(new AppError("Payment Link with ID not found", 404));
    }

    return successResMsg(res, 200, {
      message: "Payment Link has been enabled successfully",
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.deletePaymentLink = catchAsync(async (req, res, next) => {
  try {
    const doc = await PaymentLink.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError("Payment Link with ID not found", 404));

    return successResMsg(res, 204, {});
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getPaymentLinkTransactions = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentLink = await PaymentLink.findById(id);

    if (!paymentLink) {
      return next(new AppError("Payment Link with ID not found", 404));
    }

    const { details } = await req.cryptoBox.getPaymentPageTransactions(
      paymentLink.paymentReference
    );
    console.log(details);
    const dataInfo = { paymentlink: paymentLink, paymentPage: details };

    return successResMsg(res, 200, dataInfo);
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.mailPaymentDetails = catchAsync(async (req, res, next) => {
  try {
    const {
      crypto_symbol,
      wallet_address,
      amountInCrypto,
      fiat_amount,
      fiat_currency,
      email,
      name,
    } = req.body;

    let qr;

    qr = await QRCode.toDataURL(wallet_address);

    ejs.renderFile(
      path.join(__dirname, "../../views/deposit-email-template.ejs"),
      {
        crypto_symbol,
        wallet_address,
        amountInCrypto,
        fiat_amount,
        fiat_currency,
        name,
        qr,
      },
      async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: email,
          subject: "Your Deposit Payment Information",
          message: data,
        };
        await sendEmail(options);
      }
    );

    return successResMsg(res, 200, {
      message: "Payment details has been mailed to your email",
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.clickHereToMonitorStatus = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentLink = await PaymentLink.findById(id).select("+isDisabled");

    if (!paymentLink) {
      return next(new AppError("Payment Link not found", 404));
    }

    const { details } = await req.cryptoBox.getPaymentPage(
      paymentLink.paymentReference
    );
    const { crypto_symbol, amountInCrypto, fiat_amount, fiat_currency } =
      req.body;
    const data = {
      crypto_symbol,
      amountInCrypto,
      fiat_amount,
      fiat_currency,
      status: details.status,
    };
    const dataInfo = { message: "Monitor your transaction details", data };
    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(error, 400));
  }
});

exports.convertToImage = async (req, res, next) => {
  let text = req.query.text;

  qr = await QRCode.toDataURL(text);
  const data = Buffer.from(qr, "base64");

  res.send(data);
};
