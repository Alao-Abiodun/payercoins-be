const cron = require("node-cron");
const WithdrawalRequest = require("../models/withdrawalRequestModel");
const Settings = require("../models/settingsModel");
const FiatWithdrawalSettings = require("../models/fiatWithdrawalSettingsModel");
const { processWithdrawal } = require("../controllers/admin/settlements");
require("dotenv").config();

const environment = process.env.NODE_ENV === 'production' ? 'live' : 'sandbox';

const cryoptoTransactionModule = require("../crypto-module")(environment);

const settleUser = async () => {
  // Find all the pending fiat withdrawal requests
  const pendingWithdrawalRequests = await WithdrawalRequest.find({
    status: "pending",
  });

  // Terminate the whole process if there are no pending withdrawals
  if (pendingWithdrawalRequests.length === 0) {
    return;
  }

  // Attempt to process all pending withdrawal request that have been confirmed
  for (const withdrawalRequest of pendingWithdrawalRequests) {
    const transactionStatus =
      await cryoptoTransactionModule.getTransactionStatus(
        withdrawalRequest.transaction.uuid
      );

    // If transaction isn't found or it is not completed, move to the next transaction
    if (!transactionStatus || transactionStatus !== "successful") continue;

    // Get the user bank information
    const { settlements } = await Settings.findOne({
      user: withdrawalRequest.user,
    });

    
    // Move to the next transaction if settlement account isn't found or there is no bank code
    if (!settlements.bank || !settlements.bank.bank_code) continue;
    
    const [ fiatWithdrawalSettings ] = await FiatWithdrawalSettings.find();
    const { provider_to_use } = fiatWithdrawalSettings;
    
    if (provider_to_use === 'flutterwave') {
      // Initiate payment to the user bank account using flutterwave
      await processWithdrawal({
        amount: withdrawalRequest.fiat_amount,
        id: withdrawalRequest._id,
        accountNumber: settlements.bank.account_number,
        bankCode: settlements.bank.bank_code,
      }, provider_to_use);
    } else if (provider_to_use === 'fincra') {
      // Initiate payment to the user bank account using flutterwave
      await processWithdrawal({
        sourceCurrency: 'NGN',
        destinationCurrency: 'NGN',
        amount: withdrawalRequest.fiat_amount,
        business: process.env.PAYERCOINS_FINCRA_BUSINESS_ID,
        description: `NGN-${withdrawalRequest.fiat_amount}-${Date.now()}`,
        customerReference: withdrawalRequest._id,
        paymentDestination: 'bank_account',
        beneficiary: {
          firstName: settlements.bank.account_name.split(' ')[0],
          type: 'individual',
          accountHolderName: settlements.bank.account_name,
          accountNumber: settlements.bank.account_number,
          bankCode: settlements.bank.bank_code,
        }
      }, provider_to_use);
    }
  }
};

// customerReference: withdrawalRequest._id + "fourth",

// This job runs every ten minutes
cron.schedule("* */10 * * * *", () => {
  console.log('JOB RUNNING');
  settleUser();
});

module.exports = { settleUser };
