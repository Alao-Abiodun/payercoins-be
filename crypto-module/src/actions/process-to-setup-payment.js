const PaymentLinkRepository = require('../repositories/payment-link');
const cryptoRepository = require('../repositories/crypto');
const TransactionRepository = require('../repositories/transaction');
const AddressRepository = require('../repositories/address');
const PaymentLinkTransactionRepository = require('../repositories/payment-link-transaction');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const addressService = require('../services/treshold/generate-address');
const coinmarketcap = require('../services/coinmarketcap/coinmarketcap');
const helper = require('../helpers');
const userHelper = require('../../../controllers/users/helper');

module.exports = (configs, environment) => async (req, res, next) => {

    // get reference from request params
    const reference = req.params.reference;

    const { crypto } = req.body;

    const { name, email, amount, message } = req.body;

    // check if crypto is present
    if (!crypto) {
        return res.status(422).json({ success: false, message: 'Crypto is required' });
    }

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        return res.status(422).json({ success: false, message: 'Reference is required and must be a string' });
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get the payment link
    const paymentLinkData = await PaymentLinkRepository.findOneWithPaymentLinkTransactionWithoutClient(database, reference);

    // if payment link is not found
    if (!paymentLinkData) {
        return res.status(404).json({ success: false, message: 'Payment invoice not found' });
    }

    const paymentLink = paymentLinkData.get();

    // validate if amountType is fixed or custom and return error if amount is passed if fixed
    if (paymentLink.amountType === 'fixed' && amount) {
        return res.status(400).json({ success: false, message: 'Amount is not required for fixed payment link' });
    }

    if (paymentLink.amountType === 'custom' && (!amount || amount <= 0)) {
        return res.status(400).json({ success: false, message: 'Amount must be set before proceeding' });
    }

    let paymentLinkAmount = 0;

    if (paymentLink.amountType === 'custom') {
        paymentLinkAmount = parseFloat(amount);
    }
    else {
        paymentLinkAmount = parseFloat(paymentLink.amount);
    }

    // validate name is present in metadata if not add it to metadata
    if (!paymentLink.metaData.name) {

        // validate name is present and is a String
        if (!name || typeof name !== 'string') {
            return res.status(422).json({ success: false, message: 'Name is required and must be a string' });
        }

        paymentLink.metaData.name = name;
    }

    // validate email is present in metadata if not add it to metadata
    if (!paymentLink.metaData.email) {

        // validate name is present and is a String
        if (!email || typeof email !== 'string') {
            return res.status(422).json({ success: false, message: 'Email is required and must be a string' });
        }

        paymentLink.metaData.email = email;
    }

    // check if payment link is already cancelled
    if (paymentLink.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Payment invoice has been cancelled' });
    }

    // check if payment link is already cancelled
    if (paymentLink.status === 'initiated') {
        return res.status(400).json({ success: false, message: 'Payment invoice has been initiated' });
    }

    // check if payment link is already successful
    if (paymentLink.status === 'successful') {
        return res.status(400).json({ success: false, message: 'Payment invoice has already been paid successfully' });
    }

    // check if payment link has expired
    let date1 = new Date(paymentLink.expiresAt);
    let date2 = new Date();
    let hourDiff = (date1 - date2) / 36e5;
    if(hourDiff < 0) {
        return res.status(400).json({ success: false, message: 'Payment invoice has expired' });
    }

    // check if amount is greater than zero
    if (paymentLinkAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be set before proceeding' });
    }

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // get the specific crypto
    const cryptosToCreateTransactionFor = cryptos.find(c => c.uuid === crypto);

    // check if crypto is valid
    if (!cryptosToCreateTransactionFor) {
        return res.status(422).json({ success: false, message: 'Crypto is invalid' });
    }

    // check if crypto isActive is set to true
    if (!cryptosToCreateTransactionFor.isActive) {
        return res.status(503).json({ success: false, message: `Crypto transfer of ${cryptosToCreateTransactionFor.name} is not available at the moment` });
    }

    // check if crypto is in the payemtlink availableCryptos
    if (!paymentLink.availableCrypto.find(c => c.uuid === crypto.uuid)) {
        return res.status(422).json({ success: false, message: 'Crypto is not available for this payment link' });
    }

    // get user crypto wallet
    const walletData = await cryptoWalletRepository.findOne(database, paymentLink.clientId, cryptosToCreateTransactionFor.id);

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
    
        //const rateResonse = await coinmarketcap(configs.coinmarketcap, environment)([cryptosToCreateTransactionFor.symbol], ['USD']);
    
        if (!rateResonse.status) {
            return res.status(500).json({ success: false, message: 'Payment invoice is down at the moment, try again' });
        }
    
        // get rate for crypto
        rate = rateResonse.rate[mainSymbol].quote['USD'].price; // TODO: get rate from crypto
        if (!rate) {
            return res.status(500).json({ success: false, message: 'Payment invoice is down at the moment, try again' });
        }
    }

    let amountRemaining = paymentLinkAmount;

    // generate address
    const response = await addressService(configs.treshold, environment)(cryptosToCreateTransactionFor.symbol, helper.generate.generateString(10));

    if (!response.status) {
        return res.status(500).json({ success: false, message: 'Payment invoice is down at the moment, try again' });
    }

    //get user fee percent and fee preference
    const userFee = await userHelper.getUserTransactionFeePrefereenceByUuid(paymentLink.clientId);  
    // console.log('--- userFee ---');
    // console.log(userFee); 

    // calculate the fee
    const fee = userFee.preference === 'user' ? ((paymentLink.amount/100) * userFee.fee) : 0;
    // console.log('--- fee ---');
    // console.log(fee);

    // calculate the amount to be paid
    const amountToPay = parseFloat(amountRemaining) + fee;
    // console.log('--- amountToPay ---');
    // console.log(amountToPay);

    // convert from amount usd to crypto
    const cryptoAmount = parseFloat((amountToPay / rate).toFixed(6));

    // use sequelize db transactions
    const dbTransaction = await database.sequelize.transaction();

    try {
        // update the payment link
        const updatedPaymentLinkData = await PaymentLinkRepository.updateWithId(database, paymentLink.id, {
            status: 'initiated',
            metaData: paymentLink.metaData,
            amount: paymentLinkAmount,
        });

        // create transaction
        const transaction = await TransactionRepository.create(database, {
            cryptoId: cryptosToCreateTransactionFor.id,
            clientId: paymentLink.clientId,
            transferableType: 'link',
            amount: paymentLinkAmount,
            status: 'pending',
        }, dbTransaction);

        // create PaymentLinkTransaction
        const paymentLinkTransaction = await PaymentLinkTransactionRepository.create(database, {
            transactionId: transaction.id,
            paymentLinkId: paymentLink.id,
            cryptoWalletId: wallet.id,
            amountInUsd: amountRemaining,
            amountInCrypto: cryptoAmount,
            status: 'pending',
            rate: rate,
        }, dbTransaction);

        // create address and generate address
        const address = await AddressRepository.create(database, {
            cryptoId: cryptosToCreateTransactionFor.id,
            addressableType: 'link',
            addressableId: paymentLinkTransaction.id,
            address: response.address,
            label: 'link-' + paymentLinkTransaction.id,
            isActive: true,
            memo: response.memo
        }, dbTransaction);

        // if email, name are present in the metaData return them in the info
        const info = paymentLink.metaData.email && paymentLink.metaData.name ? { name: paymentLink.metaData.name, email: paymentLink.metaData.email } : {};
        const linkData = { page: paymentLink.metaData.page, description: paymentLink.metaData.description };


        await dbTransaction.commit();

        // send mail to email address

        const data = {
            crypto: cryptosToCreateTransactionFor,
            address: address.address,
            memo: address.memo,
            amount: {
                amountInCrypto: cryptoAmount,
                amountInUsd: amountRemaining,
                currency: { sign: '$', symbol: 'USD', name: 'US Dollar' }
            },
            linkData: linkData,
            info: info,
        }

        return res.status(200).json({ success: true, message: 'Payment initiated successfully', details: data });

    } catch (error) {
        await dbTransaction.rollback();
        console.log(error);
        return res.status(500).json({ success: false, message: 'Payment invoice is down at the moment, try again' });
    }


}