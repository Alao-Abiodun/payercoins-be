const { Queue, Worker } = require('bullmq');
const config = require('../../config');
const { insertDecimal } = require('../helpers/amount');

const cryptoRepository = require('../repositories/crypto');
const addressRepository = require('../repositories/address');
const transferRepository = require('../repositories/transfer');
const paymentLinkTransactionRepository = require('../repositories/payment-link-transaction');
const paymentPageTransactionRepository = require('../repositories/payment-page-transaction');
const paymentLinkRepository = require('../repositories/payment-link');
const cryptoWalletTransactionRepository = require('../repositories/wallet-transaction');
const cryptoWalletRepository = require('../repositories/crypto-wallet');
const TransactionRepository = require('../repositories/transaction');
const userHelper = require('../../../controllers/users/helper')
const PaymentPageRepository = require('../repositories/payment-page');
const { redisConnectionString } = require('../utils/libs/redis');

const mailSend = new Queue('mails-send', redisConnectionString());
const walletAction = new Queue('wallet-action', redisConnectionString());
const sendPushNotification = new Queue('send-push-notification', redisConnectionString());
const webhookJob = new Queue('send-webhook', redisConnectionString());

module.exports = new Worker(
    'treshold-webhook',
    async (job) => {
        try {
            console.log(`Processing Treshold Webhook of job id: ${job.id} of type: ${job.name} env: ${job.data.environment}`);

            console.log('--- Job details---');
            console.log(job);

            console.log('===== Currency =====');
            console.log(job.data.taskData.currency);

            // load the database
            const database = require('../../database/models')({ environment: job.data.environment });

            // get crypto
            const cryptoRetrieve = await cryptoRepository.findOne(database, job.data.taskData.currency);
            const crypto = cryptoRetrieve.get();
            console.log('===== Crypto =====', crypto);

            if (!crypto) return;

            const getTransaction = require('../services/treshold/get-transaction')(config.treshold, job.data.environment);

            const type = job.data.taskData.type === 1 ? 'deposit' : 'withdrawal';
            const blockchainTransactionResponse = await getTransaction(
                crypto.symbol,
                type,
                type === 'deposit' ? job.data.taskData.txid : (job.data.taskData.order_id == '' ? job.data.taskData.txid : job.data.taskData.order_id),
                type === 'deposit' ? job.data.taskData.vout_index : null,
                job.data.taskData.order_id == '' ? false : true
            );
            console.log('===== blockchainTransactionResponse =====', blockchainTransactionResponse);

            if (!blockchainTransactionResponse.status) return;

            const blockchainTransaction = blockchainTransactionResponse.data;
            console.log('======= blockchainTransaction ======', blockchainTransaction);

            const amountInCrypto = parseFloat(insertDecimal(blockchainTransaction.amount, blockchainTransaction.decimal))

            if (type === 'deposit') {
                const status = blockchainTransaction.processing_state >= 2 ? 'confirmed' : 'pending';
                const transferTransactionResponse = await transferRepository.findOne(database, `${blockchainTransaction.txid}:${blockchainTransaction.vout_index}`);

                if (!transferTransactionResponse) {
                    // this is a new tranfer

                    // get address
                    const addressRetrieveResponse = await addressRepository.findOne(database, blockchainTransaction.to_address);

                    if (!addressRetrieveResponse) return;

                    const addressRetrieve = addressRetrieveResponse.get();

                    if (addressRetrieve.addressableType === 'link') {
                        const paymentLinkTransactionResponse = await paymentLinkTransactionRepository.
                            findOnePaymentLinkTransactionWithId(database, addressRetrieve.addressableId);

                        if (!paymentLinkTransactionResponse) {
                            return;
                        }

                        const paymentLinkTransaction = paymentLinkTransactionResponse.get();
                        console.log('======= paymentLinkTransaction =======', paymentLinkTransaction);

                        // use sequelize db transactions
                        const dbTransaction = await database.sequelize.transaction();

                        try {

                            const newTransfer = await transferRepository.create(database, {
                                cryptoId: crypto.id,
                                transferableType: 'link',
                                transferableId: paymentLinkTransaction.id,
                                txId: `${blockchainTransaction.txid}:${blockchainTransaction.vout_index}`,
                                address: addressRetrieve.address,
                                status: status,
                                amount: amountInCrypto,
                                fee: insertDecimal(blockchainTransaction.fees, blockchainTransaction.addon.fee_decimal),
                                memo: blockchainTransaction.memo
                            }, dbTransaction);

                            newTransfer.isRaw = true;

                            const allTransfersForLinkTransaction = paymentLinkTransaction.transfer;
                            // console.log('allTransfersForLinkTransaction ======>>>> ', allTransfersForLinkTransaction);
                            allTransfersForLinkTransaction.push(newTransfer);

                            const { totalConfirmedAmountInCrypto, totalAmountInCrypto } = determineAmountInCryptoHasBeenReceived(allTransfersForLinkTransaction);
                            
                            await paymentLinkTransactionRepository.updateWithId(database, paymentLinkTransaction.id, {
                                confirmedAmountInUsd: totalConfirmedAmountInCrypto * paymentLinkTransaction.rate,
                                confirmedAmountInCrypto: totalConfirmedAmountInCrypto,
                            }, dbTransaction)

                            const newPaymentLinkTransactionResponse = await paymentLinkTransactionRepository.
                            findOnePaymentLinkTransactionWithId(database, addressRetrieve.addressableId);

                            const newPaymentLinkTransaction = newPaymentLinkTransactionResponse.get();
                            console.log('======= newPaymentLinkTransaction ========', newPaymentLinkTransaction);

                            newPaymentLinkTransaction.transfer = allTransfersForLinkTransaction;
                            // console.log('newPaymentLinkTransaction ======>>>> ', newPaymentLinkTransaction);

                            const paymentLinkData = await paymentLinkRepository.findOneById(database, paymentLinkTransaction.paymentLinkId);

                            // if payment link is not found
                            if (!paymentLinkData) {
                                throw new Error('Payment link not found');
                            }

                            const paymentLink = paymentLinkData.get();
                            console.log('======== paymentLink =======', paymentLink);

                            if (
                                (totalAmountInCrypto < newPaymentLinkTransaction.amountInCrypto)
                                && (totalConfirmedAmountInCrypto < newPaymentLinkTransaction.amountInCrypto)
                            ) {
                                // user didn't pay complete
                        
                                // send push notification to that effect
                        
                                console.log(`User didn't pay complete`);
                        
                                sendPushNotification.add('send-push-notification', {
                                    environment: job.data.environment,
                                    taskData: {
                                        type: 'payment-page-transaction',
                                        identifier: newPaymentLinkTransaction.reference,
                                        event: 'PAYMENT_INCOMPLETE',
                                        paymentPageTransaction: newPaymentLinkTransaction,
                                    },
                                    type: 'link'
                                })
                                /* 
                                NB: We can't send the mail here because its not cross checking the total amount that has been paid
                                */
                        
                            } else {
                                // send push notification to that transaction was seen
                                if (status != 'confirmed') {
                                    await sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-link-transaction',
                                            identifier: paymentLink.reference,
                                            event: 'PAYMENT_SEEN',
                                            paymentLink: newPaymentLinkTransaction,
                                        },
                                        type: 'link'
                                    })
                                }
                            }

                            if (status == 'confirmed') {

                                if (totalConfirmedAmountInCrypto >= newPaymentLinkTransaction.amountInCrypto) {
                                    // notify with mail  
                        
                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-link-transaction',
                                            identifier: newPaymentLinkTransaction.reference,
                                            event: 'PAYMENT_COMPLETED',
                                            paymentLink: newPaymentLinkTransaction,
                                        },
                                        type: 'link'
                                    })
                        
                                    // carryout the wallet action
                                    walletAction.add('wallet-action', {
                                        environment: job.data.environment, taskData: {
                                            crypto,
                                            transactionType: 'link-deposit',
                                            action: 'CREDIT',
                                            paymentPageTransaction: newPaymentLinkTransaction,
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
                                    
                                    sendMails('payment-page-transaction:customer', 'PAYMENT_COMPLETED',
                                        newPaymentLinkTransaction.metaData.email,
                                        newPaymentLinkTransaction, job.data.environment, job.data.taskData.currency
                                    );
                        
                                    sendMails('payment-page-transaction:merchant', 'PAYMENT_COMPLETED', 
                                        await userHelper.getUserDetailsByUuid(paymentLink.clientId),
                                        newPaymentLinkTransaction, job.data.environment, job.data.taskData.currency
                                    );
                                }
                                else {
                                    // notify the payment link email
                        
                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-link-transaction',
                                            identifier: newPaymentLinkTransaction.reference,
                                            event: 'PAYMENT_INCOMPLETE',
                                            paymentLink: newPaymentLinkTransaction,
                                        },
                                        type: 'link'
                                    })
                                }
                            }
                            

                            /*if (status === 'confirmed') {

                                paymentLinkTransaction.confirmedAmountInUsd =
                                    parseFloat(paymentLinkTransaction.confirmedAmountInUsd) +
                                    parseFloat(parseFloat(amountInCrypto) * parseFloat(paymentLinkTransaction.rate));

                                paymentLinkTransaction.confirmedAmountInCrypto =
                                    parseFloat(paymentLinkTransaction.confirmedAmountInCrypto) + parseFloat(amountInCrypto)

                                await paymentLinkTransactionRepository.updateWithId(database, paymentLinkTransaction.id, {
                                    confirmedAmountInUsd: paymentLinkTransaction.confirmedAmountInUsd,
                                    confirmedAmountInCrypto: paymentLinkTransaction.confirmedAmountInCrypto,
                                    status: status === 'pending' ? 'processing' : status,
                                })
                            }

                            const paymentLinkResponse = await paymentLinkRepository.findOneWithPaymentLinkTransactionUsingId(database, paymentLinkTransaction.paymentLinkId);

                            if (!paymentLinkResponse) {
                                return;
                            }

                            const paymentLink = paymentLinkResponse.get();

                            if (parseFloat(paymentLink.paymentLinkTransaction.confirmedAmountInCrypto ?? 0)
                                < parseFloat(paymentLink.paymentLinkTransaction.amountInCrypto)) {

                                console.log('--- PAYMENT NOT completed, Amount ====>>> ---');
                                console.log(paymentLink.paymentLinkTransaction.confirmedAmountInCrypto)

                                /*console.log(`User didn't pay complete`);

                                sendPushNotification.add('send-push-notification', {
                                    environment: job.data.environment,
                                    taskData: {
                                        type: 'payment-link-transaction',
                                        identifier: paymentLink.reference,
                                        event: 'INCOMPLETE_PAYMENT',
                                        paymentLink: paymentLink,
                                    }
                                })*/
                            /*}
                            else {

                                if (status == 'confirmed') {

                                    console.log('--- PAYMENT completed, Amount ====>>> ---');

                                    /* carryout the wallet action
                                    walletAction.add('wallet-action', {
                                        environment: job.data.environment, taskData: {
                                            crypto,
                                            transactionType: 'link-deposit',
                                            action: 'CREDIT',
                                            paymentLink: paymentLink,
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

                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-link-transaction',
                                            identifier: paymentLink.reference,
                                            event: 'PAYMENT_COMPLETED',
                                            paymentLink: paymentLink,
                                        }
                                    })*/

                                /*    if (paymentLink.type === 'api') {
                                        // TODO: send Webhook Notification
                                    }
                                }
                                else {
                                    // notify the payment link email

                                    console.log('------ sendPushNotification 1 should send -------');

                                    //send push notification to that transaction was seen
                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-link-transaction',
                                            identifier: paymentLink.reference,
                                            event: 'PAYMENT_SEEN',
                                            paymentLink: paymentLink,
                                        },
                                        type: 'link'
                                    })

                                    console.log('push notification sent');

                                    if (paymentLink.type === 'api') {
                                        // TODO: send Webhook Notification
                                    }
                                }
                            }*/

                            await dbTransaction.commit();
                        }
                        catch (error) {
                            await dbTransaction.rollback();

                            throw new Error(error);
                        }

                        // TODO: notify the payment link email

                        // TODO: notify the payment link push notification
                    }

                    if (addressRetrieve.addressableType === 'page') {
                        const paymentPageTransactionResponse = await paymentPageTransactionRepository.
                            findOnePaymentPageTransactionWithId(database, addressRetrieve.addressableId);

                        if (!paymentPageTransactionResponse) {
                            return;
                        }

                        const paymentPageTransaction = paymentPageTransactionResponse.get();

                        // use sequelize db transactions
                        const dbTransaction = await database.sequelize.transaction();

                        try {
                            const newTransfer = await transferRepository.create(database, {
                                cryptoId: crypto.id,
                                transferableType: 'page',
                                transferableId: paymentPageTransaction.id,
                                txId: `${blockchainTransaction.txid}:${blockchainTransaction.vout_index}`,
                                address: addressRetrieve.address,
                                status: status,
                                amount: amountInCrypto,
                                fee: insertDecimal(blockchainTransaction.fees, blockchainTransaction.addon.fee_decimal),
                                memo: blockchainTransaction.memo
                            }, dbTransaction);

                            newTransfer.isRaw = true;

                            const allTransfersForPageTransaction = paymentPageTransaction.transfers;
                            allTransfersForPageTransaction.push(newTransfer);

                            const { totalConfirmedAmountInCrypto, totalAmountInCrypto } = determineAmountInCryptoHasBeenReceived(allTransfersForPageTransaction);

                            await paymentPageTransactionRepository.updateWithId(database, paymentPageTransaction.id, {
                                confirmedAmountInUsd: totalConfirmedAmountInCrypto * paymentPageTransaction.rate,
                                confirmedAmountInCrypto: totalConfirmedAmountInCrypto,
                            }, dbTransaction)

                            const newPaymentPageTransactionResponse = await paymentPageTransactionRepository.
                                findOnePaymentPageTransactionWithId(database, addressRetrieve.addressableId);

                            const newPaymentPageTransaction = newPaymentPageTransactionResponse.get();
                            newPaymentPageTransaction.transfers = allTransfersForPageTransaction;

                            const paymentPageData = await PaymentPageRepository.findOneById(database, paymentPageTransaction.paymentPageId);

                            // if payment link is not found
                            if (!paymentPageData) {
                              throw new Error('Payment page not found');
                            }
                    
                            const paymentPage = paymentPageData.get();

                            if (
                                (totalAmountInCrypto < newPaymentPageTransaction.amountInCrypto)
                                && (totalConfirmedAmountInCrypto < newPaymentPageTransaction.amountInCrypto)
                            ) {
                                // user didn't pay complete

                                // send push notification to that effect

                                console.log(`User didn't pay complete`);

                                sendPushNotification.add('send-push-notification', {
                                    environment: job.data.environment,
                                    taskData: {
                                        type: 'payment-page-transaction',
                                        identifier: newPaymentPageTransaction.reference,
                                        event: 'PAYMENT_INCOMPLETE',
                                        paymentPageTransaction: newPaymentPageTransaction,
                                    },
                                    type: 'page'
                                })
                                /* 
                                NB: We can't send the mail here because its not cross checking the total amount that has been paid
                                */

                            }
                            else {
                                // send push notification to that transaction was seen
                                if (status != 'confirmed') {
                                    await sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-page-transaction',
                                            identifier: newPaymentPageTransaction.reference,
                                            event: 'PAYMENT_SEEN',
                                            paymentPageTransaction: newPaymentPageTransaction,
                                        },
                                        type: 'page'
                                    })

                                    /*sendMails('payment-page-transaction', 'PAYMENT_SEEN', {
                                        user: newPaymentPageTransaction.metaData.email,
                                        client: await userHelper.getUserDetailsByUuid(paymentPage.clientId),
                                    }, newPaymentPageTransaction, job.data.environment);*/
                                }
                            }

                            // TODO: notify the payment link email

                            // TODO: notify the payment link push notification

                            if (status == 'confirmed') {

                                if (totalConfirmedAmountInCrypto >= newPaymentPageTransaction.amountInCrypto) {
                                    // notify with mail  

                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-page-transaction',
                                            identifier: newPaymentPageTransaction.reference,
                                            event: 'PAYMENT_COMPLETED',
                                            paymentPageTransaction: newPaymentPageTransaction,
                                        },
                                        type: 'page'
                                    })

                                    // carryout the wallet action
                                    walletAction.add('wallet-action', {
                                        environment: job.data.environment, taskData: {
                                            crypto,
                                            transactionType: 'page-deposit',
                                            action: 'CREDIT',
                                            paymentPageTransaction: newPaymentPageTransaction,
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
                                    
                                    sendMails('payment-page-transaction:customer', 'PAYMENT_COMPLETED',
                                        newPaymentPageTransaction.metaData.email,
                                        newPaymentPageTransaction, job.data.environment, job.data.taskData.currency
                                    );

                                    sendMails('payment-page-transaction:merchant', 'PAYMENT_COMPLETED', 
                                        await userHelper.getUserDetailsByUuid(paymentPage.clientId),
                                        newPaymentPageTransaction, job.data.environment, job.data.taskData.currency
                                    );
                                }
                                else {
                                    // notify the payment link email

                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-page-transaction',
                                            identifier: newPaymentPageTransaction.reference,
                                            event: 'PAYMENT_INCOMPLETE',
                                            paymentPageTransaction: newPaymentPageTransaction,
                                        },
                                        type: 'page'
                                    })
                                    
                                    /*console.log('--- INCOMPLETE BALANCE CALC 2 ---')
                                    let balance = parseFloat(newPaymentPageTransaction.amountInCrypto - totalAmountInCrypto);

                                    sendMails('payment-page-transaction:customer', 'PAYMENT_INCOMPLETE',
                                        newPaymentPageTransaction.metaData.email,
                                        { ...newPaymentPageTransaction, totalAmountInCrypto: totalAmountInCrypto, amountToBalance: balance }, job.data.environment, job.data.taskData.currency
                                    );

                                    sendMails('payment-page-transaction:merchant', 'PAYMENT_INCOMPLETE', 
                                        await userHelper.getUserDetailsByUuid(paymentPage.clientId),
                                        { ...newPaymentPageTransaction, totalAmountInCrypto: totalAmountInCrypto, amountToBalance: balance }, job.data.environment, job.data.taskData.currency
                                    );*/
                                }
                            }

                            await dbTransaction.commit();

                        } catch (error) {

                            await dbTransaction.rollback();

                            throw new Error(error);
                        }
                    }

                    if (addressRetrieve.addressableType === 'wallet') {
                        // get wallet connected to the address
                        const walletRetrieveResponse = await cryptoWalletRepository.findByPk(database, addressRetrieve.addressableId);

                        if (!walletRetrieveResponse) {
                            return;
                        }

                        const cryptoWallet = walletRetrieveResponse.get();

                        // use sequelize db transactions
                        const dbTransaction = await database.sequelize.transaction();

                        try {
                            const transaction = await TransactionRepository.create(database, {
                                cryptoId: crypto.id,
                                clientId: cryptoWallet.clientId,
                                transferableType: 'wallet',
                                amount: amountInCrypto,
                                status: 'pending'
                            }, dbTransaction);

                            // create WalletTransaction
                            const walletTransaction = await cryptoWalletTransactionRepository.create(database, {
                                transactionId: transaction.id,
                                cryptoWalletId: cryptoWallet.id,
                                amount: amountInCrypto,
                                fee: 0,
                                type: 'deposit',
                                status: 'pending',
                                address: addressRetrieve.address,
                                memo: blockchainTransaction.memo,
                            }, dbTransaction);

                            walletTransaction.infos = {
                                crypto: crypto,
                                clientId: cryptoWallet.clientId
                            }

                            const newTransfer = await transferRepository.create(database, {
                                cryptoId: crypto.id,
                                transferableType: 'wallet',
                                transferableId: walletTransaction.id,
                                txId: `${blockchainTransaction.txid}:${blockchainTransaction.vout_index}`,
                                address: addressRetrieve.address,
                                status: status,
                                amount: amountInCrypto,
                                fee: insertDecimal(blockchainTransaction.fees, blockchainTransaction.addon.fee_decimal),
                                memo: blockchainTransaction.memo
                            }, dbTransaction);

                            if (status == 'confirmed') {
                                // carryout the wallet action
                                walletAction.add('wallet-action', {
                                    environment: job.data.environment, taskData: {
                                        crypto,
                                        transactionType: 'wallet-deposit',
                                        action: 'CREDIT',
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

                                // notify with mail
                                sendMails('wallet-deposit', 'PAYMENT_COMPLETED', 
                                    await userHelper.getUserDetailsByUuid(cryptoWallet.clientId),
                                    walletTransaction, job.data.environment, job.data.taskData.currency
                                );
                            }

                            await dbTransaction.commit();

                        } catch (error) {

                            await dbTransaction.rollback();

                            throw new Error(error);                       
                        }
                    }
                    // TODO: addressableType wallet
                }
                else 
                {
                    // this is an existing tranfer
                    const transferTransaction = transferTransactionResponse.get();

                    if (transferTransaction.transferableType === 'link') {
                        if (transferTransaction.status !== 'confirmed' && status === 'confirmed') {
                            const paymentLinkTransactionResponse = await paymentLinkTransactionRepository.findByPk(database, transferTransaction.transferableId);

                            if (!paymentLinkTransactionResponse) {
                                return;
                            }

                            const paymentLinkTransaction = paymentLinkTransactionResponse.get();
                            console.log('======= paymentLinkTransaction 2 ========', paymentLinkTransaction);

                            // use sequelize db transactions
                            const dbTransaction = await database.sequelize.transaction();

                            try {
                                await transferRepository.updateWithId(database, transferTransaction.id, {
                                    status: status,
                                });

                                paymentLinkTransaction.confirmedAmountInUsd =
                                    parseFloat(paymentLinkTransaction.confirmedAmountInUsd ?? 0) + parseFloat(parseFloat(amountInCrypto) * parseFloat(paymentLinkTransaction.rate));

                                paymentLinkTransaction.confirmedAmountInCrypto =
                                    parseFloat(paymentLinkTransaction.confirmedAmountInCrypto ?? 0) + parseFloat(amountInCrypto)

                                await paymentLinkTransactionRepository.updateWithId(database, paymentLinkTransaction.id, {
                                    confirmedAmountInUsd: paymentLinkTransaction.confirmedAmountInUsd,
                                    confirmedAmountInCrypto: paymentLinkTransaction.confirmedAmountInCrypto,
                                    status: status,
                                })

                                const paymentLinkResponse = await paymentLinkRepository.findOneWithPaymentLinkTransactionUsingId(database, paymentLinkTransaction.paymentLinkId);

                                const paymentLink = paymentLinkResponse.get();
                                console.log('======== paymentLink 2 =======', paymentLink);

                                if (parseFloat(paymentLink.paymentLinkTransaction.confirmedAmountInCrypto ?? 0)
                                    >= parseFloat(paymentLink.paymentLinkTransaction.amountInCrypto)) {
                                    // notify the payment link email

                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-link-transaction',
                                            identifier: paymentLink.reference,
                                            event: 'PAYMENT_COMPLETED',
                                            paymentLink: paymentLink,
                                        },
                                        type: 'link'
                                    })

                                    // carryout the wallet action
                                    walletAction.add('wallet-action', {
                                        environment: job.data.environment, taskData: {
                                            crypto,
                                            transactionType: 'link-deposit',
                                            action: 'CREDIT',
                                            paymentLink: paymentLink,
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
                                    // console.log('--- PAYMENT LINK DEPOSIT ---', paymentLink);
                                    sendMails('payment-page-transaction:customer', 'PAYMENT_COMPLETED',
                                        paymentLink.metaData.email,
                                        paymentLink.paymentLinkTransaction, job.data.environment, job.data.taskData.currency
                                    );

                                    let merchantEmail = await userHelper.getUserDetailsByUuid(paymentLink.clientId);
                                    //get user secret key
                                    let merchantSecretKey = await userHelper.getUserSecretKey(paymentLink.clientId, job.data.environment);

                                    sendMails('payment-page-transaction:merchant', 'PAYMENT_COMPLETED', 
                                        merchantEmail,
                                        paymentLink.paymentLinkTransaction, job.data.environment, job.data.taskData.currency
                                    );

                                    webhookJob.add('send-webhook', {
                                        environment: job.data.environment, 
                                        taskData: {
                                            crypto,
                                            paymentLink: paymentLink,
                                            merchantSecretKey: merchantSecretKey,
                                            merchantEmail: merchantEmail
                                        }
                                    })
                                    .then(
                                        (job) => {
                                            console.log(`Job Has been added to Webhook Notification Queue`);
                                        },
                                        (err) => {
                                            console.log(`Job Has failed to be added to Webhook Notification Queue`);
                                        }
                                    );
                                }
                                else {
                                    // notify the payment link email

                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-link-transaction',
                                            identifier: paymentLink.reference,
                                            event: 'PAYMENT_INCOMPLETE',
                                            paymentLink: paymentLink,
                                        },
                                        type: 'link'
                                    })
                                    console.log('--- INCOMPLETE BALANCE CALC ---');
                                    let balance = parseFloat(paymentLink.paymentLinkTransaction.amountInCrypto - paymentLink.paymentLinkTransaction.confirmedAmountInCrypto);
                                    
                                    sendMails('payment-page-transaction:customer', 'PAYMENT_INCOMPLETE', 
                                        paymentLink.metaData.email,
                                        { ...paymentLink.paymentLinkTransaction, totalAmountInCrypto: paymentLink.paymentLinkTransaction.confirmedAmountInCrypto, amountToBalance: balance  }, 
                                        job.data.environment, job.data.taskData.currency
                                    );

                                    sendMails('payment-page-transaction:merchant', 'PAYMENT_INCOMPLETE', 
                                        await userHelper.getUserDetailsByUuid(paymentLink.clientId),
                                        { ...paymentLink.paymentLinkTransaction, totalAmountInCrypto: paymentLink.paymentLinkTransaction.confirmedAmountInCrypto, amountToBalance: balance  }, 
                                        job.data.environment, job.data.taskData.currency
                                    );
                                }

                                await dbTransaction.commit();
                            }
                            catch (error) {
                                await dbTransaction.rollback();

                                throw new Error(error);
                            }
                        }
                    }

                    if (transferTransaction.transferableType === 'page') {
                        if (transferTransaction.status !== 'confirmed' && status === 'confirmed') {

                            const paymentPageTransactionResponse = await paymentPageTransactionRepository.
                                findOnePaymentPageTransactionWithId(database, transferTransaction.transferableId);

                            if (!paymentPageTransactionResponse) {
                                return;
                            }

                            const paymentPageTransaction = paymentPageTransactionResponse.get();

                            // use sequelize database transaction
                            const dbTransaction = await database.sequelize.transaction();

                            try {
                                await transferRepository.updateWithId(database, transferTransaction.id, {
                                    status: status,
                                }, dbTransaction);

                                // replace the new transfer with the old
                                const allTransfersForPageTransaction = paymentPageTransaction.transfers.map((transfer) => {
                                    if (transferTransaction.id == transfer.id) {
                                        transferTransaction.status = status
                                        transferTransaction.isRaw = true
                                        return transferTransaction
                                    }
                                    else {
                                        return transfer
                                    }
                                })

                                const { totalConfirmedAmountInCrypto, totalAmountInCrypto } = determineAmountInCryptoHasBeenReceived(allTransfersForPageTransaction);

                                await paymentPageTransactionRepository.updateWithId(database, paymentPageTransaction.id, {
                                    confirmedAmountInUsd: totalConfirmedAmountInCrypto * paymentPageTransaction.rate,
                                    confirmedAmountInCrypto: totalConfirmedAmountInCrypto,
                                }, dbTransaction)

                                const newPaymentPageTransactionResponse = await paymentPageTransactionRepository.
                                    findOnePaymentPageTransactionWithId(database, transferTransaction.transferableId);

                                const newPaymentPageTransaction = await newPaymentPageTransactionResponse.get();
                                newPaymentPageTransaction.transfers = allTransfersForPageTransaction;
                                newPaymentPageTransaction.confirmedAmountInUsd = totalConfirmedAmountInCrypto * paymentPageTransaction.rate;
                                newPaymentPageTransaction.confirmedAmountInCrypto = totalConfirmedAmountInCrypto;

                                const paymentPageData = await PaymentPageRepository.findOneById(database, paymentPageTransaction.paymentPageId);

                                // if payment link is not found
                                if (!paymentPageData) {
                                  throw new Error('Payment page not found');
                                }
                        
                                const paymentPage = paymentPageData.get();

                                if (totalConfirmedAmountInCrypto >= newPaymentPageTransaction.amountInCrypto) {
                                    // notify the payment link email

                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-page-transaction',
                                            identifier: newPaymentPageTransaction.reference,
                                            event: 'PAYMENT_COMPLETED',
                                            paymentPageTransaction: newPaymentPageTransaction,
                                        },
                                        type: 'page'
                                    })

                                    // carryout the wallet action
                                    walletAction.add('wallet-action', {
                                        environment: job.data.environment, taskData: {
                                            crypto,
                                            transactionType: 'page-deposit',
                                            action: 'CREDIT',
                                            paymentPageTransaction: newPaymentPageTransaction,
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
                                    
                                    sendMails('payment-page-transaction:customer', 'PAYMENT_COMPLETED',
                                        newPaymentPageTransaction.metaData.email,
                                        newPaymentPageTransaction, job.data.environment, job.data.taskData.currency
                                    );

                                    sendMails('payment-page-transaction:merchant', 'PAYMENT_COMPLETED', 
                                        await userHelper.getUserDetailsByUuid(paymentPage.clientId),
                                        newPaymentPageTransaction, job.data.environment, job.data.taskData.currency
                                    );

                                }
                                else {
                                    // notify the payment link email

                                    sendPushNotification.add('send-push-notification', {
                                        environment: job.data.environment,
                                        taskData: {
                                            type: 'payment-page-transaction',
                                            identifier: newPaymentPageTransaction.reference,
                                            event: 'PAYMENT_INCOMPLETE',
                                            paymentPageTransaction: newPaymentPageTransaction,
                                        },
                                        type: 'page'
                                    })
                                    console.log('--- INCOMPLETE BALANCE CALC ---');
                                    let balance = parseFloat(newPaymentPageTransaction.amountInCrypto - totalConfirmedAmountInCrypto);
                                    
                                    sendMails('payment-page-transaction:customer', 'PAYMENT_INCOMPLETE', 
                                        newPaymentPageTransaction.metaData.email, 
                                        { ...newPaymentPageTransaction, totalAmountInCrypto: totalConfirmedAmountInCrypto, amountToBalance: balance  }, 
                                        job.data.environment, job.data.taskData.currency
                                    );

                                    sendMails('payment-page-transaction:merchant', 'PAYMENT_INCOMPLETE', 
                                        await userHelper.getUserDetailsByUuid(paymentPage.clientId),
                                        { ...newPaymentPageTransaction, totalAmountInCrypto: totalConfirmedAmountInCrypto, amountToBalance: balance  }, 
                                        job.data.environment, job.data.taskData.currency
                                    );
                                    
                                }
                                await dbTransaction.commit();

                            } catch (error) {

                                await dbTransaction.rollback();

                                throw new Error(error);
                            }
                        }
                    }

                    if (transferTransaction.transferableType === 'wallet') {
                        if (transferTransaction.status !== 'confirmed' && status === 'confirmed') {

                            const walletTransactionResponse = await cryptoWalletTransactionRepository.findByPk(database, transferTransaction.transferableId);

                            if (!walletTransactionResponse) {
                                return;
                            }

                            const walletTransaction = walletTransactionResponse.get();

                            // get clientId from transaction to send mail
                            const TransactionsLog = await TransactionRepository.findByPk(database, walletTransaction.transactionId);

                            if (!TransactionsLog) {
                                return;
                            }
                            const transactionsLog = TransactionsLog.get();

                            // use sequelize database transaction
                            const dbTransaction = await database.sequelize.transaction();

                            try {
                                
                                await transferRepository.updateWithId(database, transferTransaction.id, {
                                    status: status,
                                }, dbTransaction);
                                
                                if (status == 'confirmed') {
                                    // carryout the wallet action
                                    walletAction.add('wallet-action', {
                                        environment: job.data.environment, taskData: {
                                            crypto,
                                            transactionType: 'wallet-deposit',
                                            action: 'CREDIT',
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

                                    // notify the wallet email
                                    sendMails('wallet-deposit', 'PAYMENT_COMPLETE', 
                                        await userHelper.getUserDetailsByUuid(transactionsLog.clientId),
                                        walletTransaction, job.data.environment, job.data.taskData.currency
                                    );
                                }

                                await dbTransaction.commit();

                            } catch (error) {

                                await dbTransaction.rollback();

                                throw new Error(error);                                
                            }
                        }
                    }
                }
            }
            console.log(`Type: ${type}`);
            if(type === 'withdrawal')
            {
                const status = blockchainTransaction.processing_state >= 2 ? 'confirmed' : 'pending';
                let transferTransactionResponse;
                transferTransactionResponse = await transferRepository.findOne(database, `${blockchainTransaction.order_id}`);
                
                if(!transferTransactionResponse) {
                    transferTransactionResponse = await transferRepository.findOne(database, `${blockchainTransaction.txid}`);
                }

		        if(!transferTransactionResponse) {
                    throw new Error('Transfer transaction not found');
                }

                const transferTransaction = transferTransactionResponse.get();

                const dbTransaction = await database.sequelize.transaction();

                try {
                    await transferRepository.updateWithId(database, transferTransaction.id, {
                        status: status,
                        txid: blockchainTransaction.txid,
                    }, dbTransaction);

                    //if(status === 'confirmed') {
                        const walletTransactionResponse = await cryptoWalletTransactionRepository.findByPk(database, transferTransaction.transferableId);

                        if (!walletTransactionResponse) {
                            return;
                        }

                        const walletTransaction = walletTransactionResponse.get();
                        
                        // get clientId from transaction to send mail
                        const TransactionsLog = await TransactionRepository.findByPk(database, walletTransaction.transactionId);

                        if (!TransactionsLog) {
                            return;
                        }
                        const transactionsLog = TransactionsLog.get();

                        await TransactionRepository.updateWithId(database, walletTransaction.transactionId, {
                            status: 'successful',
                          }, dbTransaction);
                        
        
                        await cryptoWalletTransactionRepository.updateWithId(database, transferTransaction.transferableId, {
                            status: 'successful',
                        }, dbTransaction);
                    //}
                    if(status === 'confirmed') {
                        sendMails('wallet-withdrawal', 'COMPLETED',
                            await userHelper.getUserDetailsByUuid(transactionsLog.clientId),
                            transferTransaction, job.data.environment, job.data.taskData.currency
                        );
                    }
                    
                    await dbTransaction.commit();

                } catch (error) {

                    await dbTransaction.rollback();
                    console.log(error);

                    throw new Error(error);           
                                         
                }
            }

        } catch (error) {
            console.log(error);
        }
    },
    redisConnectionString()
);

function determineStatusOfTransaction(paymentLink) {
    // loop over the paymentLinkTransactions and add the confirmedAmountInUsd
    let totalConfirmedAmountInUsd = 0;
    let totalAmountInUsd = 0;

    paymentLink.paymentLinkTransactions.forEach(paymentLinkTransaction => {
        if (paymentLinkTransaction.status === 'confirmed') {
            totalConfirmedAmountInUsd += parseFloat(paymentLinkTransaction.confirmedAmountInUsd);
        }

        if (paymentLinkTransaction.status === 'processing') {
            totalAmountInUsd += parseFloat(paymentLinkTransaction.confirmedAmountInUsd);
        }
    });

    if (totalConfirmedAmountInUsd >= paymentLink.amount) {
        return { state: 'confirmed' };
    }

    if (totalConfirmedAmountInUsd + totalAmountInUsd >= parseFloat(paymentLink.amount)) {
        return { state: 'partial', balance: totalAmountInUsd };
    }

    return { state: 'pending', balance: parseFloat(paymentLink.amount) - parseFloat(totalConfirmedAmountInUsd + totalAmountInUsd) };
}

function determineAmountInCryptoHasBeenReceived(transfers, newTransfer = null) {
    // loop over the paymentLinkTransactions and add the confirmedAmountInUsd
    let totalConfirmedAmountInCrypto = 0;
    let totalAmountInCrypto = 0;

    transfers.forEach(transfer => {
        transfer = transfer.isRaw ? transfer : transfer.get();

        if (transfer.status === 'confirmed') {
            totalConfirmedAmountInCrypto += parseFloat(transfer.amount);
        }

        if (transfer.status === 'pending') {
            totalAmountInCrypto += parseFloat(transfer.amount);
        }
    });

    if (newTransfer) {

        newTransfer = newTransfer.isRaw ? newTransfer : newTransfer.get();

        if (newTransfer.status === 'confirmed') {
            totalConfirmedAmountInCrypto += parseFloat(newTransfer.amount);
        }

        if (newTransfer.status === 'pending') {
            totalAmountInCrypto += parseFloat(newTransfer.amount);
        }
    }

    return { totalConfirmedAmountInCrypto, totalAmountInCrypto };
}

function determineResponseOnPaymentTransaction(paymentLinkTransaction, amountInCrypto) {
    if (parseFloat(amountInCrypto) >= parseFloat(paymentLinkTransaction.amountInCrypto)) {
        return { state: true }
    }

    return { state: false, message: `You still have unpaid balance`, balance: parseFloat(paymentLinkTransaction.amountInCrypto) - parseFloat(amountInCrypto) }
}

function sendMails(type, event, email, info, environment, currency)
{
    mailSend.add('mails-send', {
        environment: environment,
        taskData: {
            type: type,
            event: event,
            email: email,
            currency: currency,
            info
        }
    })

    /*mailSend.add('mails-send', {
        environment: environment,
        taskData: {
            type: `${type}:client`,
            event: event,
            email: emails.client,
            info
        }
    })*/
}
