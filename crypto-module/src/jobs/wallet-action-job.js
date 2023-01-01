const { Queue, Worker } = require('bullmq');
const config = require('../../config');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const cryptoWalletHistoryRepository = require('../repositories/crypto-wallet-history');
const paymentLinkRepository = require('../repositories/payment-link');
const TransactionRepository = require('../repositories/transaction');
const paymentLinkTransactionRepository = require('../repositories/payment-link-transaction');
const sendService = require('../services/treshold/send');
const cryptoWalletTransactionRepository = require('../repositories/wallet-transaction');
const transferRepository = require('../repositories/transfer');
const paymentPageTransactionRepository = require('../repositories/payment-page-transaction');
const userHelper = require('../../../controllers/users/helper')
const PaymentPageRepository = require('../repositories/payment-page');
const { redisConnectionString } = require('../utils/libs/redis');

const mailSend = new Queue('mails-send', redisConnectionString());
const sendWebhook = new Queue('mails-send', redisConnectionString());
const { generateString } = require('../helpers/generate');

module.exports = new Worker(
  'wallet-action',
  async (job) => {

    console.log(`Processing Wallet Action of job id: ${job.id} of type: ${job.name}`);
    console.log('------ Wallet Action Job ------');

    // load the database
    const database = require('../../database/models')({ environment: job.data.environment });

    // // get the wallet action type (Debit or Credit)
    // const actionType = job.data.taskData.action;

    const transactionType = job.data.taskData.transactionType;

    const dbTransaction = await database.sequelize.transaction();

    try {
      if (transactionType === 'link-deposit') {
        const paymentLink = job.data.taskData.paymentLink;
        // get the wallet

        const walletsData = await cryptoWalletRepository.findByPk(database, paymentLink.paymentLinkTransaction.cryptoWalletId);

        const wallet = walletsData.get();
        console.log('------wallet Balance-----', wallet);

        // get user fee percent and fee preference
        const userFee = await userHelper.getUserTransactionFeePrefereenceByUuid(paymentLink.clientId);
        console.log('--- userFee --- ', userFee);

        const confirmedAmountInCrypto = parseFloat(paymentLink.paymentLinkTransaction.confirmedAmountInCrypto)
        console.log('--- confirmedAmountInCrypto ---');
        console.log(confirmedAmountInCrypto);

        const fee = ((confirmedAmountInCrypto/100) * userFee.fee);
        console.log('--- fee ----');
        console.log(fee);

        const totalAmount = confirmedAmountInCrypto - fee;
        console.log('--- totalAmount ----');
        console.log(totalAmount);

        // console.log('------ initial wallet Balance -----', wallet.balance);

        if(isNaN(wallet.balance)) {
          console.log('******** wallet.balance is NaN ********');
          //wallet.balance = 0;
        }

        let newBalance = parseFloat(wallet.balance) + parseFloat(totalAmount);
        if(isNaN(newBalance)) {
          console.log('******** balance is NaN ********');
          newBalance = wallet.balance;
        }

        console.log(`confirmedAmountInCrypto: ${confirmedAmountInCrypto}, calc: ${newBalance}  `)

        await cryptoWalletRepository.updateWithId(database, wallet.id, {
          balance: newBalance
        }, dbTransaction);

        await cryptoWalletHistoryRepository.create(database, {
          cryptoWalletId: wallet.id,
          transactionId: paymentLink.paymentLinkTransaction.transactionId,
          previousBalance: parseFloat(wallet.balance),
          currentBalance: newBalance,
        }, dbTransaction);

        await paymentLinkRepository.updateWithId(database, paymentLink.id, {
          status: 'successful'
        }, dbTransaction);

        await paymentLinkTransactionRepository.updateWithId(database, paymentLink.paymentLinkTransaction.id, {
          status: 'successful'
        }, dbTransaction);

        await TransactionRepository.updateWithId(database, paymentLink.paymentLinkTransaction.transactionId, {
          status: 'successful',
        }, dbTransaction);
      }

      if (transactionType === 'page-deposit') {
        const paymentPageTransaction = job.data.taskData.paymentPageTransaction;
        // console.log('------paymentPageTransaction-----', paymentPageTransaction);

        const walletsData = await cryptoWalletRepository.findByPk(database, paymentPageTransaction.cryptoWalletId);

        const wallet = walletsData.get();

        const paymentPageData = await PaymentPageRepository.findOneById(database, paymentPageTransaction.paymentPageId);

        // if payment link is not found
        if (!paymentPageData) {
          throw new Error('Payment page not found');
        }

        const paymentPage = paymentPageData.get();
        // console.log('---- paymentPage in Wallet Action Job ----', paymentPage);

        // get user fee percent and fee preference
        const userFee = await userHelper.getUserTransactionFeePrefereenceByUuid(paymentPage.clientId);
        // console.log('--- userFee --- ', userFee);

        const confirmedAmountInCrypto = parseFloat(paymentPageTransaction.confirmedAmountInCrypto)
        // console.log('--- confirmedAmountInCrypto ---');
        // console.log(confirmedAmountInCrypto);

        const fee = ((confirmedAmountInCrypto/100) * userFee.fee);
        // console.log('--- fee ----');
        // console.log(fee);

        const totalAmount = confirmedAmountInCrypto - fee;
        // console.log('--- totalAmount ----');
        // console.log(totalAmount);

        // console.log('------ initial wallet Balance -----', wallet.balance);

        if(isNaN(wallet.balance)) {
          console.log('******** wallet.balance is NaN ********');
          //wallet.balance = 0;
        }

        let newBalance = parseFloat(wallet.balance) + parseFloat(totalAmount);
        if(isNaN(newBalance)) {
          console.log('******** balance is NaN ********');
          newBalance = wallet.balance;
        }

        console.log(`confirmedAmountInCrypto: ${confirmedAmountInCrypto}, calc: ${newBalance}  `)
        

        await cryptoWalletRepository.updateWithId(database, wallet.id, {
          balance: newBalance
        }, dbTransaction)

        await cryptoWalletHistoryRepository.create(database, {
          cryptoWalletId: wallet.id,
          transactionId: paymentPageTransaction.transactionId,
          previousBalance: parseFloat(wallet.balance),
          currentBalance: newBalance,
        }, dbTransaction)

        await paymentPageTransactionRepository.updateWithId(database, paymentPageTransaction.id, {
          status: 'successful'
        }, dbTransaction)

        await TransactionRepository.updateWithId(database, paymentPageTransaction.transactionId, {
          status: 'successful',
        }, dbTransaction);
      }

      if (transactionType === 'wallet-send') {

        const walletTransaction = job.data.taskData.walletTransaction;
        
        const walletsData = await cryptoWalletRepository.findByPk(database, walletTransaction.cryptoWalletId);
        
        const wallet = walletsData.get();

        // check for sufficient funds
        if (parseFloat(wallet.balance) < parseFloat(walletTransaction.amount)) {
          await cryptoWalletTransactionRepository.updateWithId(database, walletTransaction.id, {
            status: 'declined'
          }, dbTransaction)
          return;
        }

        // console.log('--- walletTransaction.amount ---', walletTransaction.amount);

        // console.log('--- walletTransaction.fee ---', walletTransaction.fee);

        // Deduct the transaction fee from the withdrawal amount before sending
        const actualAmountToSend = walletTransaction.amount - walletTransaction.fee
        // console.log('--- actualAmountToSend ---', actualAmountToSend);

        // carry out send
        const sendTransaction = await sendService(config.treshold, job.data.environment)(
          walletTransaction.infos.crypto.symbol,
          walletTransaction.address,
          actualAmountToSend,
          generateString(20),
          walletTransaction.infos.clientId,
          walletTransaction.memo
        )

        if (!sendTransaction.status) {
          await cryptoWalletTransactionRepository.updateWithId(database, walletTransaction.id, {
            status: 'declined'
          }, dbTransaction)
        }
        else {
          await cryptoWalletRepository.updateWithId(database, wallet.id, {
            balance: parseFloat(wallet.balance) - parseFloat(walletTransaction.amount + walletTransaction.fee)
          }, dbTransaction)

          await cryptoWalletHistoryRepository.create(database, {
            cryptoWalletId: wallet.id,
            transactionId: walletTransaction.transactionId,
            previousBalance: parseFloat(wallet.balance),
            currentBalance: parseFloat(wallet.balance) - parseFloat(walletTransaction.amount + walletTransaction.fee),
          }, dbTransaction)

          const newTransfer = await transferRepository.create(database, {
            cryptoId: walletTransaction.infos.crypto.id,
            transferableType: 'wallet',
            transferableId: walletTransaction.id,
            txId: `${sendTransaction.id}`,
            address: walletTransaction.address,
            status: 'pending',
            amount: walletTransaction.amount,
            fee: walletTransaction.fee,
            memo: walletTransaction.memo
          }, dbTransaction);

          await cryptoWalletTransactionRepository.updateWithId(database, walletTransaction.id, {
            status: 'pending'
          }, dbTransaction)
        }
      }

      if(transactionType === 'wallet-deposit') {
        const walletTransaction = job.data.taskData.walletTransaction;

        const walletsData = await cryptoWalletRepository.findByPk(database, walletTransaction.cryptoWalletId);

        const wallet = walletsData.get();
        
        await cryptoWalletRepository.updateWithId(database, wallet.id, {
          balance: parseFloat(wallet.balance) + parseFloat(walletTransaction.amount)
        }, dbTransaction)

        await cryptoWalletHistoryRepository.create(database, {
          cryptoWalletId: wallet.id,
          transactionId: walletTransaction.transactionId,
          previousBalance: parseFloat(wallet.balance),
          currentBalance: parseFloat(wallet.balance) + parseFloat(walletTransaction.amount),
        }, dbTransaction)

        await cryptoWalletTransactionRepository.updateWithId(database, walletTransaction.id, {
          status: 'successful'
        }, dbTransaction)

        await TransactionRepository.updateWithId(database, walletTransaction.transactionId, {
          status: 'successful',
        }, dbTransaction);
      }

      await dbTransaction.commit();

    } catch (error) {
      await dbTransaction.rollback();
      console.log(error);
      throw new Error(error);
    }
  },
  redisConnectionString()
);