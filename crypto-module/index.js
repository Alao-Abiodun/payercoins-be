const configs = require('./config/index');

module.exports = (environment) => {

    // validate environment is provided and is either 'live' or 'sandbox'
    if (!environment || (environment !== 'live' && environment !== 'sandbox')) {
        throw new Error('Invalid environment provided, use either "live" or "sandbox"');
    }

    return {

        /**
         * @description: This function is used to get all cryptos
         * @return {object} - a new instance of crypto in the form of {'cryptos': []}
        */
        getCryptos: require('./src/actions/get-cryptos')(configs, environment),

        /**
         * @description: This function is used to create a new instance of user crypto wallets to store payment from payment links
         * @param {string} userId - The user id
         * @param {array} cryptoTypes - a list of crypto types
         * @return {object} - a new instance of user crypto wallets in the form of {'wallets': []}
        */
        createWallets: require('./src/actions/create-wallets')(configs, environment),

        /**
         * @description: This function is used to create a new instance of user crypto wallets, if any exist skip the creation of that one
         * @param {string} userId - The user id
         * @param {array} cryptoTypes - a list of crypto types
         * @return {object} - a new instance of user crypto wallets in the form of {'wallets': []}
        */
        createWalletsIfDoesNotExist: require('./src/actions/create-wallets-if-doesnt-exist')(configs, environment),

        /**
         * @description: This function is used to get user specified crypto wallets
         * @param {string} userId - The user id
         * @param {array} cryptoTypes - a list of crypto types
         * @return {object} - a new instance of user crypto wallets in the form of {'wallets': []}
        */
        getWallets: require('./src/actions/get-wallets')(configs, environment),

        /**
         * @description: This function is used to get user specified crypto wallets
         * @param {string} userId - The user id
         * @return {object} - a new instance of user crypto wallets in the form of {'wallets': []}
        */
        getWalletsByClientID: require('./src/actions/get-wallet-by-clientid')(configs, environment),

        /**
         * @description: This function is used to get user specified crypto wallets
         * @param {uuid} userId - The user id
         * @param {string} cryptoType - crypto type
         * @return {object} - a new instance of user crypto wallets in the form of {'transactions': []}
        */
        getWalletTransactions: require('./src/actions/get-wallet-transactions')(configs, environment),

        /**\
         * @description: This function is used to create links for user to pay using the specified crypto types
         * @param {string} userId - The user id
         * @param {array} avaialableCrypto - the list of available crypto types the user wants to receive payment in
         * @param {float} amount - the amount of the payment (in USD)
         * @param {string} amountType - wether the amount is fixed or custom
         * @param {integer} countDownTime - the time interval that users can use to pay for the payment (in minutes)
         * @param {string} type - the type (means) of the payment link (e.g. 'api', 'web')
         * @param {object} metaData -this is an object of metadata  - {description, email, name, page} 'email' & 'name' are optional on web payment links
         * @return {object}
        */
        generatePaymentLink: require('./src/actions/generate-payment-link')(configs, environment),

        /**\
         * @description: This function is used to create payment page for user to pay using the specified crypto types
         * @param {string} userId - The user id
         * @param {array} avaialableCrypto - the list of available crypto types the user wants to receive payment in
         * @param {float} amount - the amount of the payment (in USD)
         * @param {string} amountType - wether the amount is fixed or custom
         * @param {object} metaData -this is an object of metadata  - {description, name}
         * @return {object}
        */
        generatePaymentPage: require('./src/actions/generate-payment-page')(configs, environment),

        /**
         * @description: This function is used to get the payment link
         * @param {string} userId - The user id
         * @return {object}
        */
        getPaymentLinks: require('./src/actions/get-payment-link-transactions')(configs, environment),

        /**
         * @description: This function is used to get the payment pages
         * @param {string} userId - The user id
         * @return {object}
        */
        getPaymentPages: require('./src/actions/get-payment-pages')(configs, environment),

        /**
         * @description: This function is used to get a payment link by id
         * @param {string} userId - The user id
         * @param {string} reference - The reference link id
         * @return {object}
        */
        getPaymentLink: require('./src/actions/get-payment-link')(configs, environment),

        /**
         * @description: This function is used to get a payment page by reference
         * @param {string} reference - The reference link id
         * @return {object}
        */
        getPaymentPage: require('./src/actions/get-payment-page')(configs, environment),

        /**
         * @description: This function is used to get a payment page by reference
         * @param {uuid} clientId - The id of the client
         * @param {string} reference - The reference link id
         * @return {object}
        */
        clientGetPaymentPage: require('./src/actions/get-client-payment-page')(configs, environment),

        /**
         * @description: This function is used to disable payment page by reference
         * @param {uuid} clientId - The id of the client
         * @param {string} reference - The reference link id
         * @return {object}
        */
        disablePaymentPage: require('./src/actions/disable-payment-page')(configs, environment),

        /**
         * @description: This function is all payments to a payment page
         * @param {string} reference - The reference link id
         * @return {object}
        */
        getPaymentPageTransactions: require('./src/actions/get-payment-page-transactions')(configs, environment),

        /**
         * @description: This function create a receiving address for a wallet for wallet deposit
         * @param {uuid} clientId - The id of the client
         * @param {string} cryptoType - The slug of the crypto to be created
         * @return {object}
        */
        createAddressForWallet: require('./src/actions/create-address-for-wallet')(configs, environment),

        /**
         * @description: This function retreveing all receiving address for a wallet for wallet deposit
         * @param {uuid} clientId - The id of the client
         * @param {string} cryptoType - The slug of the crypto to be created
         * @return {object}
        */
        getAddressesForWallet: require('./src/actions/get-addresses-for-wallet')(configs, environment),

        /**
         * @description: This function is for sending crypto out of wallet to address
         * @param {uuid} clientId - The id of the client
         * @param {string} cryptoType - The slug of the crypto to be created
         * @param {nubmer} amount - The amount in the crypto value
         * @param {nubmer} fee - The fee amount in the crypto value
         * @param {string} address - The address to send to
         * @param {string} memo - The memo of the transaction
         * @return {object}
        */
        sendCryptoToAddress: require('./src/actions/send-crypto-form-wallet')(configs, environment),

        /**
         * @description: This function retreveing all receiving address for a wallet for wallet deposit
         * @param {uuid} clientId - The id of the client
         * @param {string} cryptoType - The slug of the crypto to be created
         * @return {object}
        */
        getTransactionsForWallet: require('./src/actions/get-transactions-for-wallet')(configs, environment),

        /**
         * @description: This function retreveing all transactions of a client
         * @param {uuid} clientId - The id of the client
         * @return {object}
        */
         getClientTransactions: require('./src/actions/get-client-transactions')(configs, environment),
        
         /**
         * @description: This function verifies a crypto address
         * @param {string} address - The crypto address
         * @param {string} symbol - The wallet symbol
         * @return {object}
        */
         verifyCryptoAddress: require('./src/actions/verify-crypto-address')(configs, environment),

         /**
         * @description: This function returns the transaction summary
         * @return {object}
        */
          getTransactionSummary: require('./src/actions/get-total-transaction-summary')(configs, environment),

        /**
         * @description: This function returns a particular transaction status
         * @return {object}
        */
          getTransactionStatus: require('./src/actions/get-transaction-status')(configs, environment),
        /**
         * @description: This funnction manually completes a page deposit transaction that errors out in the associated job
         * @return {object}
        */
         completeCryptoDepositTransaction: require('./src/actions/complete-crypto-deposit')(configs, environment),
         /**
         * @description: This funnction gets crypto by its symbol
         * @return {object}
        */
         getCryptoBySymbol: require('./src/actions/get-crypto-by-symbol')(configs, environment),
        /**
         * @description: This funnction gets crypto by its symbol
         * @return {object}
        */
         createWalletDeposit: require('./src/actions/create-wallet-deposit')(configs, environment),
    }
}