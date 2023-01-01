const config = require('../../config');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const cryptoWalletHistoryRepository = require('../repositories/crypto-wallet-history');
const cryptoWalletTransactionRepository = require('../repositories/wallet-transaction');
const paymentLinkTransactionRepository = require('../repositories/payment-link-transaction');
const TransactionRepository = require('../repositories/transaction');
const paymentPageTransactionRepository = require('../repositories/payment-page-transaction');
const PaymentPageRepository = require('../repositories/payment-page');
const paymentLinkRepository = require('../repositories/payment-link');
const saveManualDepositTransaction = require('../../../utils/libs/completeDepositTransaction');

module.exports =
  (configs, environment) => async (transactionId, transactionType) => {
    // load the database
    const database = require('../../database/models')({ environment });

    if (transactionType === 'page-deposit') {
      return await completePaymentPageDeposit(
        transactionId,
        transactionType,
        database
      );
    }

    if (transactionType === 'wallet-deposit') {
      return await completeWalletDeposit(
        transactionId,
        transactionType,
        database
      );
    }

    if (transactionType === 'link-deposit') {
      return await completePaymentLinkDeposit(
        transactionId,
        transactionType,
        database
      );
    }
  };

// Complete a payment page transaction to fix NAN balance issue
const completePaymentPageDeposit = async (
  transactionId,
  transactionType,
  database
) => {
  const dbTransaction = await database.sequelize.transaction();

  try {
    const paymentPageTransaction =
      await paymentPageTransactionRepository.findPaymentPageTransactionByTransactionId(
        database,
        transactionId
      );

    if (!paymentPageTransaction) {
      throw new Error('Payment page transaction not found');
    }

    const walletsData = await cryptoWalletRepository.findByPk(
      database,
      paymentPageTransaction.cryptoWalletId
    );

    const wallet = walletsData.get();

    const paymentPageData = await PaymentPageRepository.findOneById(
      database,
      paymentPageTransaction.paymentPageId
    );

    // if payment page is not found
    if (!paymentPageData) {
      throw new Error('Payment page not found');
    }

    // Abort the transaction if amount in crypto is not available
    if (!paymentPageTransaction.confirmedAmountInCrypto) {
      return {
        error: true,
        message: 'Amount in crypto does not exist for this transaction',
      };
    }

    // Get the previous balance from the crypto transaction history
    const { previousBalance } =
      await cryptoWalletHistoryRepository.findByTransactionId(
        database,
        paymentPageTransaction.transactionId
      );

    const confirmedAmountInCrypto = parseFloat(
      paymentPageTransaction.confirmedAmountInCrypto
    );

    const newBalance =
      parseFloat(previousBalance) + parseFloat(confirmedAmountInCrypto);

    await cryptoWalletRepository.updateWithId(
      database,
      wallet.id,
      {
        balance: newBalance,
      },
      dbTransaction
    );

    await cryptoWalletHistoryRepository.create(
      database,
      {
        cryptoWalletId: wallet.id,
        transactionId: paymentPageTransaction.transactionId,
        previousBalance: parseFloat(previousBalance),
        currentBalance: newBalance,
      },
      dbTransaction
    );

    await paymentPageTransactionRepository.updateWithId(
      database,
      paymentPageTransaction.id,
      {
        status: 'successful',
      },
      dbTransaction
    );

    await TransactionRepository.updateWithId(
      database,
      paymentPageTransaction.transactionId,
      {
        status: 'successful',
      },
      dbTransaction
    );

    await dbTransaction.commit();

    // Insert the transaction details in the manually updated deposit table for record purpose
    await saveManualDepositTransaction(
      transactionId,
      transactionType,
      previousBalance,
      newBalance,
      wallet.id
    );

    return { error: false, message: 'Transaction completed.' };
  } catch (error) {
    await dbTransaction.rollback();
    console.log(error);
    throw new Error(error);
  }
};

const completeWalletDeposit = async (
  transactionId,
  transactionType,
  database
) => {
  const dbTransaction = await database.sequelize.transaction();

  try {
    const walletTransaction =
      await cryptoWalletTransactionRepository.findCryptoWalletTransactionByTransactionId(
        database,
        transactionId
      );

    if (!walletTransaction) {
      throw new Error('Wallet transaction not found');
    }

    const walletsData = await cryptoWalletRepository.findByPk(
      database,
      walletTransaction.cryptoWalletId
    );

    const wallet = walletsData.get();

    // Get the previous balance from the crypto transaction history
    const { previousBalance } =
      await cryptoWalletHistoryRepository.findByTransactionId(
        database,
        walletTransaction.transactionId
      );

    const newBalance = parseFloat(previousBalance) + parseFloat(walletTransaction.amount)

    await cryptoWalletRepository.updateWithId(
      database,
      wallet.id,
      {
        balance: newBalance,
      },
      dbTransaction
    );

    await cryptoWalletHistoryRepository.create(
      database,
      {
        cryptoWalletId: wallet.id,
        transactionId: walletTransaction.transactionId,
        previousBalance: parseFloat(previousBalance),
        currentBalance: newBalance,
      },
      dbTransaction
    );

    await cryptoWalletTransactionRepository.updateWithId(
      database,
      walletTransaction.id,
      {
        status: 'successful',
      },
      dbTransaction
    );

    await TransactionRepository.updateWithId(
      database,
      walletTransaction.transactionId,
      {
        status: 'successful',
      },
      dbTransaction
    );

    await dbTransaction.commit();

    // Insert the transaction details in the manually updated deposit table for record purpose
    await saveManualDepositTransaction(
      transactionId,
      transactionType,
      previousBalance,
      newBalance,
      wallet.id
    );

    return { error: false, message: 'Transaction completed.' };
  } catch (error) {
    await dbTransaction.rollback();
    console.log(error);
    throw new Error(error);
  }
};

// Complete a payment link deposit transaction
const completePaymentLinkDeposit = async (
  transactionId,
  transactionType,
  database
) => {
  const dbTransaction = await database.sequelize.transaction();

  try {
    const paymentLinkTransaction =
      await paymentLinkTransactionRepository.findPaymentLinkTransactionByTransactionId(
        database,
        transactionId
      );

    if (!paymentLinkTransaction) {
      throw new Error('Payment link transaction not found');
    }

    const walletsData = await cryptoWalletRepository.findByPk(
      database,
      paymentLinkTransaction.cryptoWalletId
    );

    const wallet = walletsData.get();

    // Abort the trnsaction if confirmed amount in crypto is not available
    if (!paymentLinkTransaction.confirmedAmountInCrypto) {
      throw new Error('The crypto amount for this transaction is yet to be updated, please try again later');
    }

    // Get the previous balance from the crypto transaction history
    const { previousBalance } =
      await cryptoWalletHistoryRepository.findByTransactionId(
        database,
        transactionId
      );

    const newBalance =
      parseFloat(previousBalance) +
      parseFloat(paymentLinkTransaction.confirmedAmountInCrypto);

    await cryptoWalletRepository.updateWithId(database, wallet.id, {
      balance: newBalance,
    });

    await cryptoWalletHistoryRepository.create(database, {
      cryptoWalletId: wallet.id,
      transactionId: paymentLinkTransaction.transactionId,
      previousBalance: parseFloat(previousBalance),
      currentBalance: newBalance,
    });

    await paymentLinkRepository.updateWithId(
      database,
      paymentLinkTransaction.id,
      {
        status: 'successful',
      }
    );

    await TransactionRepository.updateWithId(
      database,
      paymentLinkTransaction.transactionId,
      {
        status: 'successful',
      }
    );

    await dbTransaction.commit();

    // Insert the transaction details in the manually updated deposit table for record purpose
    await saveManualDepositTransaction(
      transactionId,
      transactionType,
      previousBalance,
      newBalance,
      wallet.id
    );

    return { error: false, message: 'Transaction completed.' };
  } catch (error) {
    await dbTransaction.rollback();
    console.log(error);
    throw new Error(error);
  }
};
