const ejs = require("ejs"),
  path = require("path"),
  dotenv = require("dotenv"),
  Flutterwave = require("flutterwave-node-v3"),
  catchAsync = require("../../utils/libs/catchAsync"),
  AppError = require("../../utils/libs/appError"),
  WithdrawalRequest = require("../../models/withdrawalRequestModel"),
  SettingsModel = require("../../models/settingsModel"),
  FiatWithdrawalSettings = require("../../models/fiatWithdrawalSettingsModel");
FincraPayoutModel = require("../../models/fincraPayoutModel"),
  sendEmail = require("../../utils/libs/email"),
  { successResMsg, successWebhookResponse } = require("../../utils/libs/response"),
  { initiateFincraPayout } = require('../../utils/libs/fincra');
  

dotenv.config();

const {
  PAYERCOINS_FLUTTERWAVE_PUBLIC_KEY,
  PAYERCOINS_FLUTTERWAVE_SECRET_KEY,
} = process.env;

const flw = new Flutterwave(
  PAYERCOINS_FLUTTERWAVE_PUBLIC_KEY,
  PAYERCOINS_FLUTTERWAVE_SECRET_KEY
);

exports.fetchWithdrawalRequests = catchAsync(async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const withdrawalRequests = await WithdrawalRequest.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 })
      .exec();

    // get total documents in the collection
    const count = await WithdrawalRequest.countDocuments();

    if (withdrawalRequests.length <= 0) {
      return successResMsg(res, 200, {
        message: "No Withdrawal Requests so far",
      });
    }

    const dataInfo = {
      withdrawalRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(err, 500));
  }
});

exports.fetchPendingWithdrawalRequests = catchAsync(async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const withdrawalRequests = await WithdrawalRequest.find({
      status: "pending",
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 })
      .exec();

    // get total documents in the collection
    const count = await WithdrawalRequest.countDocuments({ status: "pending" });

    if (withdrawalRequests.length <= 0) {
      return successResMsg(res, 200, {
        message: "No pending Withdrawal Request so far",
      });
    }

    const dataInfo = {
      withdrawalRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(err, 500));
  }
});

exports.fetchProcessingWithdrawalRequests = catchAsync(
  async (req, res, next) => {
    try {
      const { page, limit } = req.query;

      const withdrawalRequests = await WithdrawalRequest.find({
        status: "processing",
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ updatedAt: -1 })
        .exec();

      // get total documents in the collection
      const count = await WithdrawalRequest.countDocuments({
        status: "processing",
      });

      if (withdrawalRequests.length <= 0) {
        return successResMsg(res, 200, {
          message: "No processing Withdrawal Request so far",
        });
      }

      const dataInfo = {
        withdrawalRequests,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };

      return successResMsg(res, 200, dataInfo);
    } catch (error) {
      return next(new AppError(err, 500));
    }
  }
);

exports.fetchCompletedWithdrawalRequests = catchAsync(
  async (req, res, next) => {
    try {
      const { page, limit } = req.query;

      const withdrawalRequests = await WithdrawalRequest.find({
        status: "completed",
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ updatedAt: -1 })
        .exec();

      // get total documents in the collection
      const count = await WithdrawalRequest.countDocuments({
        status: "completed",
      });

      if (withdrawalRequests.length <= 0) {
        return successResMsg(res, 200, {
          message: "No completed Withdrawal Request created so far",
        });
      }

      const dataInfo = {
        withdrawalRequests,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };

      return successResMsg(res, 200, dataInfo);
    } catch (error) {
      return next(new AppError(err, 500));
    }
  }
);

// const kudaSendMoneyCheck = async (requestBody) => {
//   const kudaWithdrawal = await axiosCall({
//     method: "post",
//     url: `${process.env.PAYERCOINS_KUDA_TEST_BASE_URL}`,
//     body: {
//       serviceType: "SINGLE_FUND_TRANSFER",
//       requestRef: 0,
//       data: requestBody,
//     },
//     headers: {
//       type: "application/json",
//     },
//   });
//   return kudaWithdrawal;
// };

exports.processWithdrawalRequest = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const withdrawalRequest = await WithdrawalRequest.find(id, {
      status: "pending",
    });

    if (!withdrawalRequest) {
      return next(new AppError("Withdrawal has been processed", 401));
    }
    const {
      settlements: { bank },
    } = await Settings.fineOne({ user: withdrawalRequest.user });

    // call kuda bank api
    // const kudaWithdraw = await kudaSendMoneyCheck({
    //     beneficiarybankCode: ,
    //     beneficiaryAccount: bank.account_number,
    //     beneficiaryName: bank.account_name,
    //     amount: withdrawalRequest.fiat_amount,
    //     narration: "withdrawNaira",
    //     nameEnquirySessionID: "13ksksk",
    //     trackingReference: withdrawalRequest._id,
    //     senderName: "solomon_olalemi"
    //   })

    // console.log(kudaWithdraw);
    const details = {
      account_bank: "",
      account_number: bank.account_number,
      amount: withdrawalRequest.fiat_amount,
      currency: "NGN",
      narration: "payments for things",
      reference: id,
    };

    const result = await flw.Transfer.initiate(details);
    console.log(result);
    if (result.status !== 'success') {
      throw new Error("Erro nge");
    }
    const withdrawalRequestProcessing =
      await withdrawalRequest.findByIdAndUpdate(
        id,
        {
          status: "completed",
          flutterwave_transaction: result.data
        },
        { new: true, runValidators: true }
      );

    if (!withdrawalRequestProcessing.n) throw new Error("Money has been transfered, but status does not change");
    const dataInfo = { message: "Money Withdrawn succesfully" };
    return successResMsg(res, 200, { dataInfo });
  } catch (error) {
    return next(new AppError(err, 500));
  }
});

exports.processWithdrawal = catchAsync(async (transferData, provider) => {
  if (provider === 'flutterwave') {
    return await processWithdrawalByFlutterwave(transferData, false); // Set isRetry to false so that a new settlement will be initiated
  }

  if (provider === 'fincra') {
    return await processWithdrawalByFincra(transferData, false); // Set isRetry to false so that a new settlement will be initiated
  }
});

exports.retryFiatWithdrawal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // Get withdrawal request
  const withdrawalRequest = await WithdrawalRequest.findById(id);

  if (!withdrawalRequest) {
    return next(
      new AppError("Withdrawal Request not found!", 404)
    );
  }

  // Throw if the request is not a failed transaction
  if (withdrawalRequest.status !== 'failed') {
    return next(
      new AppError("Withdrawal request is not a failed transaction", 400)
    );
  }

  // Check provider to use to reinitiate the transaction
  const [ fiatWithdrawalSettings ] = await FiatWithdrawalSettings.find();
  const { provider_to_use } = fiatWithdrawalSettings

  // Get user bank account information
  const { settlements } = await SettingsModel.findOne({ user: withdrawalRequest.user });

  // Throw error if bank information is not found or invalid
  if (!settlements.bank || !settlements.bank.bank_code) {
    return next(
      new AppError("User bank account information is invalid", 400)
    );
  }

  if (provider_to_use === 'flutterwave') {
    return await processWithdrawalByFlutterwave({
      id: withdrawalRequest._id,
      bankCode: settlements.bank.bank_code,
      accountNumber: settlements.bank.account_number,
      amount: withdrawalRequest.fiat_amount,
    }, true, res, next); // Retry is set to true
  }

  if (provider_to_use === 'fincra') {
    return await processWithdrawalByFincra({
      sourceCurrency: 'NGN',
      destinationCurrency: 'NGN',
      amount: withdrawalRequest.fiat_amount,
      business: process.env.PAYERCOINS_FINCRA_BUSINESS_ID,
      description: `NGN-${withdrawalRequest.fiat_amount}-${Date.now()}`,
      customerReference: `re${Date.now()}`,
      paymentDestination: 'bank_account',
      beneficiary: {
        firstName: settlements.bank.account_name.split(' ')[0],
        type: 'individual',
        accountHolderName: settlements.bank.account_name,
        accountNumber: settlements.bank.account_number,
        bankCode: settlements.bank.bank_code,
      }
    }, true, res, next, withdrawalRequest._id); // Retry is set to true
  }
});

exports.completeWithdrawalRequest = catchAsync( async (fiatSettlementData, res) => {
  const { withdrawalRequestId, webhookResponse, provider, withdrawalStatus } = fiatSettlementData;
   try {
     let user;
     let withdrawalRequest;
     if (provider === 'flutterwave') {
       //check if the withdrawal requests exist and update the status to complete.
       withdrawalRequest = await WithdrawalRequest.findByIdAndUpdate(
         webhookResponse.meta.settlementId,
         { status: withdrawalStatus, flutterwave_transaction: webhookResponse }, {
        new: true,
        runValidators: true,
       }).populate('user', '-password');
       
       user = withdrawalRequest.user;
       if (!withdrawalRequest) {
        return;
       }
     } else if (provider === 'fincra') {
       //check if the withdrawal requests exist and update the status to complete.
       withdrawalRequest = await WithdrawalRequest.findByIdAndUpdate(
         withdrawalRequestId,
         { status: withdrawalStatus, fincra_transaction: webhookResponse }, {
           new: true,
           runValidators: true,
          }).populate('user', '-password');
          
      user = withdrawalRequest.user;
      if (!withdrawalRequest) {
       return;
      }
     }

     // Notify user of successful withdrawal
     if (withdrawalStatus === 'completed') {
       ejs.renderFile(
        path.join(__dirname, '../../views/email-template.ejs'), {
            salutation: `Hello ${user.firstName},`,
            body: `Your withdrawal request has been completed and
            paid to your specified bank account.<br />
            Crypto Amount withdrawn: <strong>${withdrawalRequest.amount} ${withdrawalRequest.walletName}</strong> <br />
            Amount Credited: <strong>NGN ${withdrawalRequest.fiat_amount}</strong> <br />
            Reference: ${withdrawalRequestId}. <br />
            If you did not initiate this operation, contact support immediately.`
        }, async (err, data) => {
            //use the data here as the mail body
            const options = {
                email: user.email,
                subject: 'Withdrawal Request',
                message: data,
            };
            await sendEmail(options);
        }
      );
     }
  
    return successWebhookResponse(res, 200)
  
   } catch (error) {
    return console.log(error, 'ERROR PROCESSING PAYOUT WEBHOOK')
   }
  })

exports.DeclineWithdrawalRequest = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    //check if the withdrawal requests exist
    const withdrawalRequest = await WithdrawalRequest.findByIdAndUpdate(
      id,
      { status: "failed" },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "-password");

    console.log({ withdrawalRequest });

    if (!withdrawalRequest) {
      return next(
        new AppError("Withdrawal Request not found!, Check the id", 404)
      );
    }

    const userObject = withdrawalRequest.user;

    // console.log({userObject})

    ejs.renderFile(
      path.join(__dirname, "../../views/email-template.ejs"),
      {
        salutation: `Hello ${userObject.firstName},`,
        body: `You requested to make a withdrawal of <strong>${withdrawalRequest.amount_usd}</strong> <br /> 
         Your Withdrawal has failed and your money has been returned to your crypto Wallet.<br />
         If you did not initiate this operation, contact support immediately.`,
      },
      async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: userObject.email,
          subject: "Withdrawal Request",
          message: data,
        };
        await sendEmail(options);
      }
    );

    const dataInfo = {
      message: "Withdrawal Request has been Declined",
      withdrawalRequest,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(err, 500));
  }
});

exports.fetchBankDetails = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    const withdrawalRequest = await WithdrawalRequest.findById(id).populate(
      "user"
    );

    if (withdrawalRequest <= 0) {
      return next(new AppError("Incorrect Id"));
    }

    const findSettlementData = await SettingsModel.findOne({
      user: withdrawalRequest.user,
    });

    if (findSettlementData.length <= 0) {
      return next(new AppError("User settings not available"));
    }

    const accountData = findSettlementData.settlements.bank;

    if (!accountData || accountData.length <= 0) {
      return next(new AppError("User has not set a settlement Account"));
    }

    const dataInfo = {
      message: "Details Fetched successfully",
      withdrawalRequest,
      accountData,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(err, 500));
  }
});

const processWithdrawalByFlutterwave = async (transferData, isRetry = false, res, next) => {
  let transferDetails = {
    account_bank: transferData.bankCode,
    account_number: transferData.accountNumber,
    amount: transferData.amount,
    currency: "NGN",
    narration: `NGN-${transferData.amount}-${Date.now()}`,
    reference: isRetry ? `re${Date.now()}` : transferData.id,
    meta: {
      settlementId: transferData.id,
    },
  }

  // Use the test account information whil in test environment
  if (process.env.NODE_ENV === 'development') {
    transferDetails = {
      account_bank: "044",
      account_number: "0690000031",
      amount: 100,
      currency: "NGN",
      narration: `NGN-${transferData.amount}-${Date.now()}`,
      reference: transferData.id + "_PMCKDU_1",
      meta: {
        settlementId: transferData.id,
      },
    }
  }

  try {
    const result = await flw.Transfer.initiate(transferDetails);

    console.log(result, 'FLUTTERWAVE TRANSEFR RESULT');

    if (result.data.status === 'success') {
      // Update the withdrawal request status to processing after transfer has been initiated
      await WithdrawalRequest.findByIdAndUpdate(
        transferData.id,
        {
          status: 'processing',
          flutterwave_transaction: result.data,
        },
        { new: true, runValidators: true }
      );
    }

    // Return a proper http response when it's a retry
    if (isRetry) {
      return successResMsg(res, 200, {
        message: "Fiat withdrawal request has been re-initiated",
      }); 
    }

    return result.data;
  } catch (error) {
    if (isRetry) {
      return next(new AppError(error, 500));
    }
    return console.log(error);
  }
}

const processWithdrawalByFincra = async (transferData, isRetry = false, res, next, withdrawalRequestId = null) => {
  try {
    const transferResult = await initiateFincraPayout(transferData);

    console.log(transferResult, 'FINCRA TRANSEFR RESULT');

    if (transferResult.data.status === 'processing') {
      // Update the withdrawal request status to processing after transfer has been initiated
      const requestId = isRetry ? withdrawalRequestId : transferData.customerReference;
      await WithdrawalRequest.findByIdAndUpdate(
        requestId,
        {
          status: transferResult.data.status,
          fincra_transaction: transferResult.data,
        },
        { new: true, runValidators: true }
      );

      // Create a record of the payout for webhook processing
      if (!isRetry) {
        await FincraPayoutModel.create({
          withdrawal_request: transferData.customerReference,
          reference: transferResult.data.reference,
        });
      } else if (isRetry) {
        await FincraPayoutModel.create({
          withdrawal_request: withdrawalRequestId,
          reference: transferResult.data.reference,
        });
      }
    }
    
    // Return a proper http response when it's a retry
    if (isRetry) {
      return successResMsg(res, 200, {
        message: "Fiat withdrawal request has been re-initiated",
      }); 
    }

    return transferResult.data;
  } catch (error) {
    if (isRetry) {
      return next(new AppError(error, 500));
    }
    return console.log(error);
  }
}