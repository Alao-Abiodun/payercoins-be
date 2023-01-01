const config = require("../../config");
const cryptoWalletRepository = require("../repositories/crypto-wallet");
const cryptoWalletHistoryRepository = require("../repositories/crypto-wallet-history");
const cryptoWalletTransactionRepository = require("../repositories/wallet-transaction");
const transactionRepository = require("../repositories/transaction");
const addressRepository = require("../repositories/address");

module.exports =
  (configs, environment) => async (amount, clientId, cryptoId) => {
    // load the database
    const database = require("../../database/models")({ environment });

    const dbTransaction = await database.sequelize.transaction();

    try {
      // Create a wallet transaction with the info
      const createdTransactionPromise = transactionRepository.create(
        database,
        {
          amount,
          clientId,
          cryptoId,
          transferableType: "wallet",
          status: "successful",
        },
        dbTransaction
      );

      // Get crypto wallet
      const walletPromise = cryptoWalletRepository.findOne(
        database,
        clientId,
        cryptoId
      );

      // Batch the promises above for execution in parallel
      const [createdTransaction, wallet] = await Promise.all([
        createdTransactionPromise,
        walletPromise,
      ]);

      // Get wallet address
      const walletAddress =
        await addressRepository.findCryptoAddressViaClientAndCrypto(
          database,
          wallet.id,
          cryptoId
        );

        // Throw error if the address to credit is not found
        if (walletAddress.length === 0) {
          return {
            error: true,
            message: 'Wallet address not found',
          };
        }

      // Create a crypto wallet transaction entry
      await cryptoWalletTransactionRepository.create(
        database,
        {
          transactionId: createdTransaction.id,
          amount,
          cryptoWalletId: wallet.id,
          type: "deposit",
          status: "successful",
          address: walletAddress[0].address,
          memo: " ",
          fee: 0,
        },
        dbTransaction
      );

      const previousBalance = parseFloat(wallet.balance);
      const currentBalance = parseFloat(wallet.balance) + +amount;

      // Update wallet transaction history and wallet balance
      await Promise.all([
        cryptoWalletHistoryRepository.create(
          database,
          {
            transactionId: createdTransaction.id,
            cryptoWalletId: wallet.id,
            previousBalance,
            currentBalance,
          },
          dbTransaction
        ),
        cryptoWalletRepository.updateWithId(
          database,
          wallet.id,
          {
            balance: currentBalance,
          },
          dbTransaction
        ),
      ]);

      await dbTransaction.commit();

      return {
        data: {
          transactionId: createdTransaction.id,
          previousBalance,
          currentBalance,
          cryptoWalletId: wallet.id,
        },
        message: "Transaction completed.",
      };
    } catch (error) {
      await dbTransaction.rollback();
      console.log(error);
    }
  };
