const { Queue, Worker } = require('bullmq');

const cryptoRepository = require('../repositories/crypto');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const addressService = require('../services/treshold/verify-address');
const cryptoWalletTransactionRepository = require('../repositories/wallet-transaction');
const TransactionRepository = require('../repositories/transaction');
const { redisConnectionString } = require('../utils/libs/redis');
const getTransactionFee = require('../services/treshold/transactionFee');
const transactionFeeHelper = require('../utils/libs/transactionFeeHelper');
const { availableCryptoSymbol } = require('../utils/enums');
const coinmarketcap = require('../services/coinmarketcap/coinmarketcap');
const formatCoinmarketcapRateResponse = require('../utils/coinmarketcap');

const walletAction = new Queue('wallet-action', redisConnectionString());

module.exports = (configs, environment) => async (clientId, cryptoType, amount, fee, address, cryptoSymbol, memo) => {

    // validate clientId is present and is an Integer
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    console.log(cryptoSymbol);

    // validate avaialableCrypto is an array of string
    if (!cryptoType) {
        throw new Error('The cryptoType must be a string');
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // filter crypto types to only those that are not in the database
    const invalidCryptoTypes = [cryptoType].filter(cryptoType => !cryptos.map(crypto => crypto.slug).includes(cryptoType));

    // validate if invalid crypto types are present
    if (invalidCryptoTypes.length > 0) {
        throw new Error(`Invalid crypto types: ${invalidCryptoTypes.join(', ')}`);
    }

    // get the specific crypto
    const cryptosToCreateTransactionFor = cryptos.find(c => c.slug === cryptoType);

    // check if crypto is valid
    if (!cryptosToCreateTransactionFor) {
        throw new Error(`Invalid crypto type: ${cryptoType}`);
    }

    const crypto = configs.treshold[environment][cryptosToCreateTransactionFor.symbol];
    const parentCrypto = configs.treshold[environment][crypto.parentSymbol];

    // verify if memo is needed
    if(parentCrypto.memo && !memo) {
        throw new Error('Memo is required');
    }

    // verify address
    const response = await addressService(configs.treshold, environment)(cryptosToCreateTransactionFor.symbol, address);

    if (!response.status) {
        throw new Error('payment link is down at the moment, try again');
    }

    if(!response.address)
    {
        throw new Error(`Invalid crypto address: ${address}`);
    }

    // findOne
    const cryptoWalletData = await cryptoWalletRepository.findOne(database, clientId, cryptosToCreateTransactionFor.id);

    if (!cryptoWalletData) {
        throw new Error(`User does not have Crypto Wallet for: ${cryptosToCreateTransactionFor.slug}`);
    }

    const cryptoWallet = cryptoWalletData.get();

    // Get the transaction fee and remove it from the withdrawal amount
    const { status, data: transactionFee } = await getTransactionFee(configs.treshold, environment)(cryptoSymbol);

    if (!status) {
      throw new Error('Sorry, the withdrawal service is unavailable for now, please try again later.');
    }

    // Check the crypto selected by the user against our crypto DB
    const withdrawalCrypto = cryptos.find(crypto => crypto.symbol === cryptoSymbol);
    if (!withdrawalCrypto) {
      throw new Error('Invalid crypto coin selected, kindly check your request and try again.');
    }

    let totalTransactionFee = fee;

    let payercoinTransactionFee = 0.00 // 1 USD

    if (cryptoSymbol !== availableCryptoSymbol.btc && cryptoSymbol !== availableCryptoSymbol.eth) {
      totalTransactionFee = payercoinTransactionFee;
      console.log('------- Using $0 as tx fee ----------');
    } else {
        // Get the actual coin transaction fee
        const actualTransactionFee = transactionFeeHelper(transactionFee, withdrawalCrypto.symbol)

        console.log('==============>>>> Calculating transaction fee for', cryptoSymbol)
        const cryptoRates = await coinmarketcap(configs.coinmarketcap, environment)(cryptoSymbol.split(','), 'USD'.split(','));

      if (!cryptoRates.status) {
        throw new Error('Sorry, withdrawal service is unavailable at the moment, please try again later.');
      }

      const rate = await formatCoinmarketcapRateResponse(cryptoRates.rate);

      // Get 1 USD value of the coin being withdrawn
      payercoinTransactionFee = payercoinTransactionFee / rate[cryptoSymbol].USD;
      totalTransactionFee = actualTransactionFee + payercoinTransactionFee;
    }

    console.log('================>>>> totalTransactionFee', totalTransactionFee)

    // Throw error if the trasaction fee deducted from amount is negative
    if (amount - totalTransactionFee <= 0) {
      throw new Error(`Insufficient amount to pay for gas fee, kindly increase your withdrawal amount`);
    }

    // check wallet for sufficient funds ?
    if (parseFloat(cryptoWallet.balance) < amount) {
        throw new Error(`Insufficient funds in Crypto Wallet for: ${cryptosToCreateTransactionFor.slug}`);
    }

    // use sequelize db transactions
    const dbTransaction = await database.sequelize.transaction();

    try {

        // create transaction
        const transaction = await TransactionRepository.create(database, {
            cryptoId: cryptosToCreateTransactionFor.id,
            clientId: clientId,
            transferableType: 'wallet',
            amount: amount,
            status: 'pending'
        }, dbTransaction);

        // create WalletTransaction
        const walletTransaction = await cryptoWalletTransactionRepository.create(database, {
            transactionId: transaction.id,
            cryptoWalletId: cryptoWallet.id,
            amount: amount,
            fee: totalTransactionFee,
            type: 'send',
            status: 'initialized',
            address: address,
            memo: memo ?? '',
        }, dbTransaction);

        walletTransaction.infos = {
            crypto: cryptosToCreateTransactionFor,
            clientId: clientId
        }

        // carryout the wallet action
        walletAction.add('wallet-action', {
            environment: environment, taskData: {
                crypto,
                transactionType: 'wallet-send',
                action: 'DEBIT',
                walletTransaction: walletTransaction,
            }
        })
            .then(
                (job) => {
                    console.log(`Job Has been added to Queue`);
                },
                (err) => {
                    console.log(`Job Has failed to be added to Queue`);
                }
            );

        await dbTransaction.commit();

        return { transaction: walletTransaction };
    }
    catch (e) {
        await dbTransaction.rollback();
        console.log(e);
        throw new Error(`Error Sending Crypto to address`);
    }
}