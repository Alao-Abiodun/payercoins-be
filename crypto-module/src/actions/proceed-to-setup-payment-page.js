const PaymentPageRepository = require('../repositories/payment-page');
const cryptoRepository = require('../repositories/crypto');
const TransactionRepository = require('../repositories/transaction');
const AddressRepository = require('../repositories/address');
const PaymentPageTransactionRepository = require('../repositories/payment-page-transaction');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const addressService = require('../services/treshold/generate-address');
const coinmarketcap = require('../services/coinmarketcap/coinmarketcap');
const helper = require('../helpers');
const userHelper = require('../../../controllers/users/helper');
//const { Queue, Worker } = require('bullmq');
//const { redisConnectionString } = require('../utils/libs/redis');

//const mailSend = new Queue('mails-send', redisConnectionString());

module.exports = (configs, environment) => async (req, res, next) => {

    // get reference from request params
    const reference = req.params.reference;

    const { crypto, email, name, amount, message } = req.body;

    // check if crypto is present
    if (!crypto) {
        return res.status(422).json({ message: 'crypto is required' });
    }

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        return res.status(422).json({ message: 'reference is required and must be a string' });
    }

    // load the database
    const database = require('../../database/models')({ environment });

    const paymentPageData = await PaymentPageRepository.findOne(database, reference);

    // if payment link is not found
    if (!paymentPageData) {
        return res.status(404).json({ message: 'payment page not found' });
    }

    const paymentPage = paymentPageData.get();

    // check if payment link is already cancelled
    if (paymentPage.status !== 'active') {
        return res.status(400).json({ message: 'payment page is not active' });
    }

    // check if payment link has name and email uploaded
    if (!name || !email) {
        return res.status(400).json({ message: 'payment link name and email are required' });
    }

    if (paymentPage.amountType === 'custom' && (!amount || amount <= 0)) {
        return res.status(400).json({ message: 'amount must be set before proceeding' });
    }

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // get the specific crypto
    const cryptosToCreateTransactionFor = cryptos.find(c => c.uuid === crypto);

    // check if crypto is valid
    if (!cryptosToCreateTransactionFor) {
        return res.status(422).json({ message: 'crypto is invalid' });
    }

    // check if crypto isActive is set to true
    if (!cryptosToCreateTransactionFor.isActive) {
        return res.status(503).json({ message: `crypto transfer of ${cryptosToCreateTransactionFor.name} is not available at the moment` });
    }

    // check if crypto is in the payemtlink availableCryptos
    if (!paymentPage.availableCrypto.find(c => c.uuid === crypto.uuid)) {
        return res.status(422).json({ message: 'crypto is not available for this payment link' });
    }

    // get user crypto wallet
    const walletData = await cryptoWalletRepository.findOne(database, paymentPage.clientId, cryptosToCreateTransactionFor.id);

    const wallet = walletData.get();

    const mainSymbol = cryptosToCreateTransactionFor.symbol.includes('_') ?
        cryptosToCreateTransactionFor.symbol.slice(0, cryptosToCreateTransactionFor.symbol.indexOf("_")) : cryptosToCreateTransactionFor.symbol;

    let rate;

    if(!['BTC', 'ETH'].includes(mainSymbol)) { //this array can be extended to include more currencies
        // the crypto is a stable coin
        rate = 1; // we manually peg the rate at 1 USD
    } else {
        const rateResonse = await coinmarketcap(configs.coinmarketcap, environment)(
            [mainSymbol], ['USD']);
    
        if (!rateResonse.status) {
            return res.status(500).json({ message: 'payment page is down at the moment, try again' });
        }
    
        // get rate for crypto
        rate = rateResonse.rate[mainSymbol].quote['USD'].price; // TODO: get rate from crypto
        if (!rate) {
            return res.status(500).json({ message: 'payment page is down at the moment, try again' });
        }
    }

    // generate address
    const response = await addressService(configs.treshold, environment)(cryptosToCreateTransactionFor.symbol, helper.generate.generateString(10));

    if (!response.status) {
        console.log('error generating address');
        return res.status(500).json({ message: 'payment page is down at the moment, try again' });
    }

    //get user fee percent and fee preference
    const userFee = await userHelper.getUserTransactionFeePrefereenceByUuid(paymentPage.clientId);  
    // console.log('--- userFee ---');
    // console.log(userFee); 

    if(paymentPage.amountType !== 'fixed') {
        paymentPage.amount = amount;
    }

    const fee = userFee.preference === 'user' ? ((paymentPage.amount/100) * userFee.fee) : 0;
    // console.log('--- fee ---');
    // console.log(fee);

    const amountToPay = paymentPage.amountType === 'fixed' ? parseFloat(paymentPage.amount) + fee : parseFloat(amount) + fee;
    // console.log('--- amountToPay ---');
    // console.log(amountToPay);

    // console.log('--- paymentPage Amount ---');
    // console.log(paymentPage.amount);

    // convert from amount usd to crypto
    const cryptoAmount = parseFloat((amountToPay / rate).toFixed(6));

    // use sequelize db transactions
    const dbTransaction = await database.sequelize.transaction();

    try {
        // create transaction
        const transaction = await TransactionRepository.create(database, {
            cryptoId: cryptosToCreateTransactionFor.id,
            clientId: paymentPage.clientId,
            transferableType: 'page',
            amount: paymentPage.amount,
            status: 'pending',
        }, dbTransaction);

        // create PaymentLinkTransaction
        const paymentPageTransaction = await PaymentPageTransactionRepository.create(database, {
            transactionId: transaction.id,
            paymentPageId: paymentPage.id,
            cryptoWalletId: wallet.id,
            amountInUsd: amountToPay,
            amountInCrypto: cryptoAmount,
            status: 'pending',
            rate: rate,
            metaData: { name, email, message, fee, crypto: mainSymbol, fee: fee },
            reference: helper.generate.generateString(10)
        }, dbTransaction);

        // create address and generate address
        const address = await AddressRepository.create(database, {
            cryptoId: cryptosToCreateTransactionFor.id,
            addressableType: 'page',
            addressableId: paymentPageTransaction.id,
            address: response.address,
            label: 'page-' + paymentPageTransaction.id,
            isActive: true,
            memo: response.memo
        }, dbTransaction);

        const data = {
            crypto: cryptosToCreateTransactionFor,
            address: address.address,
            memo: address.memo,
            reference: paymentPageTransaction.reference,
            amount: {
                amountInCrypto: cryptoAmount,
                amountInUsd: amountToPay,
                currency: { sign: '$', symbol: 'USD', name: 'US Dollar' }
            },
            info: paymentPageTransaction.metaData,
            metaData: paymentPage.metaData
        }

        await dbTransaction.commit();

        // send mail to email address
        /*mailSend.add('mails-send', {
            environment: environment,
            taskData: {
                type: `payment-page-transaction:user`,
                event: 'PAYMENT_INITIALIZED',
                email: email,
                info: data
            }
        })*/

        return res.status(200).json({ message: 'payment initiated successfully', details: data });
    }
    catch (e) {
        await dbTransaction.rollback();
        console.log(e);
        return res.status(500).json({ message: 'payment link is down at the moment, try again' });
    }
}