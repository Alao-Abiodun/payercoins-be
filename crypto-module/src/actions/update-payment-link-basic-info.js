const PaymentLinkRepository = require('../repositories/payment-link');
const cryptoRepository = require('../repositories/crypto');

module.exports = (configs, environment) => async (req, res, next) => {

    // get reference from request params
    const reference = req.params.reference;

    // validate reference is present and is a String
    if (!reference || typeof reference !== 'string') {
        return res.status(422).json({ message: 'reference is required and must be a string' });
    }

    // load the database
    const database = require('../../database/models')({ environment });

    // get the payment link
    const oldPaymentLinkData = await PaymentLinkRepository.findOneWithPaymentLinkTransactionWithoutClient(database, reference);

    // if payment link is not found
    if (!oldPaymentLinkData) {
        return res.status(404).json({ message: 'payment link not found' });
    }

    const oldPaymentLink = oldPaymentLinkData.get();

    // check if payment link is already cancelled
    if (oldPaymentLink.status === 'initiated') {
        return res.status(400).json({ message: 'payment already initiated' });
    }

    // check if payment link is already cancelled
    if (oldPaymentLink.status === 'cancelled') {
        return res.status(400).json({ message: 'payment already cancelled' });
    }

    // check if payment link is already successful
    if (oldPaymentLink.status === 'successful') {
        return res.status(400).json({ message: 'payment already successful' });
    }

    const { name, email, amount, message } = req.body;

    // validate if amountType is fixed or custom and return error if amount is passed if fixed
    if (oldPaymentLink.amountType === 'fixed' && amount) {
        return res.status(400).json({ message: 'amount is not required for fixed payment link' });
    }

    // validate name is present in metadata if not add it to metadata
    if (!oldPaymentLink.metaData.name) {

        // validate name is present and is a String
        if (!name || typeof name !== 'string') {
            return res.status(422).json({ message: 'name is required and must be a string' });
        }

        oldPaymentLink.metaData.name = name;
    }

    // validate email is present in metadata if not add it to metadata
    if (!oldPaymentLink.metaData.email) {

        // validate name is present and is a String
        if (!email || typeof email !== 'string') {
            return res.status(422).json({ message: 'email is required and must be a string' });
        }
        
        oldPaymentLink.metaData.email = email;
    }

    oldPaymentLink.metaData.message = message;

    // update the payment link
    const updatedPaymentLinkData = await PaymentLinkRepository.updateWithId(database, oldPaymentLink.id, {
        metaData: oldPaymentLink.metaData,
        amount: amount,
        // status: 'initiated'
    });

    // get the payment link
    const paymentLinkData = await PaymentLinkRepository.findOneWithIdTransactionWithoutClient(database, oldPaymentLink.id);

    const paymentLink = paymentLinkData.get();

    // get all crypto types
    const cryptos = await cryptoRepository.findAll(database);

    // filter the cryptos by the ones that are in the available payment link types
    const cryptosToCreateWalletFor = cryptos.filter(crypto => paymentLink.availableCrypto.includes(crypto.slug));

    const amountDetails = {
        amount: paymentLink.amount, 
        amountRemaining: paymentLink.amount,
        amountType: paymentLink.amountType, 
        currency: { sign: '$', symbol: 'USD', name: 'US Dollar' }
    };

    // if email, name are present in the metaData return them in the info
    const info = paymentLink.metaData.email && paymentLink.metaData.name ? 
        { name: paymentLink.metaData.name, email: paymentLink.metaData.email, message: paymentLink.metaData.message } : {};

    const linkData = {page: paymentLink.metaData.page, description: paymentLink.metaData.description};

    const data = 
    {
        amountDetails: amountDetails,
        availableCrypto: cryptosToCreateWalletFor,
        transactions: paymentLink.paymentLinkTransactions,
        linkData: linkData,
        info: info,
        status: paymentLink.status,
        expiresAt: paymentLink.expiresAt,
    };

    return res.status(200).json({ message: 'payment link details recieved', details: data });
}