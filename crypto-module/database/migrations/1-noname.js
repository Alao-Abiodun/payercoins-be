'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "cryptos", deps: []
 * createTable "payment_links", deps: []
 * createTable "payment_pages", deps: []
 * createTable "addresses", deps: [cryptos]
 * createTable "crypto_wallets", deps: [cryptos]
 * createTable "transactions", deps: [cryptos]
 * createTable "payment_link_transactions", deps: [transactions, payment_links, crypto_wallets]
 * createTable "payment_page_transactions", deps: [transactions, payment_pages, crypto_wallets]
 * createTable "transfers", deps: [cryptos]
 * createTable "crypto_wallet_histories", deps: [crypto_wallets, transactions, crypto_wallets, transactions]
 * createTable "crypto_wallet_transactions", deps: [transactions, crypto_wallets, crypto_wallets, transactions]
 * addIndex "addresses_address" to table "addresses"
 * addIndex "addresses_crypto_id" to table "addresses"
 * addIndex "addresses_uuid" to table "addresses"
 * addIndex "addresses_addressable_id" to table "addresses"
 * addIndex "addresses_addressable_type_addressable_id" to table "addresses"
 * addIndex "cryptos_uuid" to table "cryptos"
 * addIndex "cryptos_slug" to table "cryptos"
 * addIndex "cryptos_is_active" to table "cryptos"
 * addIndex "crypto_wallets_client_id" to table "crypto_wallets"
 * addIndex "crypto_wallets_crypto_id" to table "crypto_wallets"
 * addIndex "crypto_wallets_uuid" to table "crypto_wallets"
 * addIndex "crypto_wallets_client_id_crypto_id" to table "crypto_wallets"
 * addIndex "payment_links_reference" to table "payment_links"
 * addIndex "payment_links_uuid" to table "payment_links"
 * addIndex "payment_link_transactions_transaction_id" to table "payment_link_transactions"
 * addIndex "payment_link_transactions_payment_link_id" to table "payment_link_transactions"
 * addIndex "payment_link_transactions_crypto_wallet_id" to table "payment_link_transactions"
 * addIndex "payment_link_transactions_uuid" to table "payment_link_transactions"
 * addIndex "payment_pages_reference" to table "payment_pages"
 * addIndex "payment_pages_uuid" to table "payment_pages"
 * addIndex "payment_page_transactions_transaction_id" to table "payment_page_transactions"
 * addIndex "payment_page_transactions_payment_page_id" to table "payment_page_transactions"
 * addIndex "payment_page_transactions_crypto_wallet_id" to table "payment_page_transactions"
 * addIndex "payment_page_transactions_uuid" to table "payment_page_transactions"
 * addIndex "transactions_crypto_id" to table "transactions"
 * addIndex "transactions_client_id" to table "transactions"
 * addIndex "transactions_uuid" to table "transactions"
 * addIndex "transactions_transferable_type" to table "transactions"
 * addIndex "transactions_crypto_id_transferable_type" to table "transactions"
 * addIndex "transfers_tx_id" to table "transfers"
 * addIndex "transfers_crypto_id" to table "transfers"
 * addIndex "transfers_uuid" to table "transfers"
 * addIndex "transfers_address" to table "transfers"
 * addIndex "transfers_transferable_id" to table "transfers"
 * addIndex "transfers_transferable_type_transferable_id" to table "transfers"
 * addIndex "crypto_wallet_histories_crypto_wallet_id" to table "crypto_wallet_histories"
 * addIndex "crypto_wallet_histories_transaction_id" to table "crypto_wallet_histories"
 * addIndex "crypto_wallet_transactions_transaction_id" to table "crypto_wallet_transactions"
 * addIndex "crypto_wallet_transactions_crypto_wallet_id" to table "crypto_wallet_transactions"
 * addIndex "crypto_wallet_transactions_uuid" to table "crypto_wallet_transactions"
 *
 **/

var info = {
    "revision": 1,
    "name": "noname",
    "created": "2021-09-13T00:55:52.287Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "cryptos",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "name": {
                        "type": Sequelize.STRING,
                        "field": "name",
                        "allowNull": false
                    },
                    "slug": {
                        "type": Sequelize.STRING,
                        "field": "slug",
                        "unique": true,
                        "allowNull": false
                    },
                    "symbol": {
                        "type": Sequelize.STRING,
                        "field": "symbol",
                        "allowNull": false
                    },
                    "sign": {
                        "type": Sequelize.STRING,
                        "field": "sign",
                        "allowNull": false
                    },
                    "type": {
                        "type": Sequelize.STRING,
                        "field": "type",
                        "allowNull": false
                    },
                    "isActive": {
                        "type": Sequelize.BOOLEAN,
                        "field": "isActive",
                        "defaultValue": true,
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "payment_links",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "reference": {
                        "type": Sequelize.STRING,
                        "field": "reference",
                        "unique": true,
                        "allowNull": false
                    },
                    "clientId": {
                        "type": Sequelize.UUID,
                        "field": "clientId",
                        "allowNull": false
                    },
                    "amount": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amount",
                        "allowNull": false
                    },
                    "type": {
                        "type": Sequelize.STRING,
                        "field": "type",
                        "allowNull": false
                    },
                    "amountType": {
                        "type": Sequelize.STRING,
                        "field": "amountType",
                        "allowNull": false
                    },
                    "availableCrypto": {
                        "type": Sequelize.JSON,
                        "field": "availableCrypto",
                        "allowNull": false
                    },
                    "status": {
                        "type": Sequelize.STRING,
                        "field": "status",
                        "allowNull": false
                    },
                    "metaData": {
                        "type": Sequelize.JSON,
                        "field": "metaData",
                        "allowNull": false
                    },
                    "expiresAt": {
                        "type": Sequelize.DATE,
                        "field": "expiresAt",
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "payment_pages",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "reference": {
                        "type": Sequelize.STRING,
                        "field": "reference",
                        "unique": true,
                        "allowNull": false
                    },
                    "clientId": {
                        "type": Sequelize.UUID,
                        "field": "clientId",
                        "allowNull": false
                    },
                    "amount": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amount",
                        "allowNull": false
                    },
                    "amountType": {
                        "type": Sequelize.STRING,
                        "field": "amountType",
                        "allowNull": false
                    },
                    "availableCrypto": {
                        "type": Sequelize.JSON,
                        "field": "availableCrypto",
                        "allowNull": false
                    },
                    "status": {
                        "type": Sequelize.STRING,
                        "field": "status",
                        "allowNull": false
                    },
                    "metaData": {
                        "type": Sequelize.JSON,
                        "field": "metaData",
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "addresses",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "cryptoId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "NO ACTION",
                        "field": "cryptoId",
                        "references": {
                            "model": "cryptos",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "addressableType": {
                        "type": Sequelize.STRING,
                        "field": "addressableType",
                        "allowNull": false
                    },
                    "addressableId": {
                        "type": Sequelize.INTEGER,
                        "field": "addressableId",
                        "allowNull": false
                    },
                    "address": {
                        "type": Sequelize.STRING,
                        "field": "address",
                        "allowNull": false
                    },
                    "label": {
                        "type": Sequelize.STRING,
                        "field": "label",
                        "allowNull": false
                    },
                    "isActive": {
                        "type": Sequelize.BOOLEAN,
                        "field": "isActive",
                        "defaultValue": true,
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "crypto_wallets",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "cryptoId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "field": "cryptoId",
                        "references": {
                            "model": "cryptos",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "clientId": {
                        "type": Sequelize.UUID,
                        "field": "clientId",
                        "allowNull": false
                    },
                    "balance": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "balance",
                        "allowNull": false
                    },
                    "isActive": {
                        "type": Sequelize.BOOLEAN,
                        "field": "isActive",
                        "defaultValue": true,
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "transactions",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "cryptoId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "field": "cryptoId",
                        "references": {
                            "model": "cryptos",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "clientId": {
                        "type": Sequelize.UUID,
                        "field": "clientId",
                        "allowNull": false
                    },
                    "transferableType": {
                        "type": Sequelize.STRING,
                        "field": "transferableType",
                        "allowNull": false
                    },
                    "amount": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amount",
                        "allowNull": false
                    },
                    "status": {
                        "type": Sequelize.STRING,
                        "field": "status",
                        "allowNull": false
                    },
                    "declinedAt": {
                        "type": Sequelize.DATE,
                        "field": "declinedAt",
                        "allowNull": true
                    },
                    "declinedReason": {
                        "type": Sequelize.TEXT,
                        "field": "declinedReason",
                        "allowNull": true
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "payment_link_transactions",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "transactionId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "NO ACTION",
                        "field": "transactionId",
                        "references": {
                            "model": "transactions",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "paymentLinkId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "field": "paymentLinkId",
                        "references": {
                            "model": "payment_links",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "cryptoWalletId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "field": "cryptoWalletId",
                        "references": {
                            "model": "crypto_wallets",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "amountInUsd": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amountInUsd",
                        "allowNull": false
                    },
                    "amountInCrypto": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amountInCrypto",
                        "allowNull": false
                    },
                    "confirmedAmountInUsd": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "confirmedAmountInUsd",
                        "allowNull": true
                    },
                    "confirmedAmountInCrypto": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "confirmedAmountInCrypto",
                        "allowNull": true
                    },
                    "rate": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "rate",
                        "allowNull": false
                    },
                    "status": {
                        "type": Sequelize.STRING,
                        "field": "status",
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "payment_page_transactions",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "transactionId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "NO ACTION",
                        "field": "transactionId",
                        "references": {
                            "model": "transactions",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "paymentPageId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "field": "paymentPageId",
                        "references": {
                            "model": "payment_pages",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "cryptoWalletId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "NO ACTION",
                        "field": "cryptoWalletId",
                        "references": {
                            "model": "crypto_wallets",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "amountInUsd": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amountInUsd",
                        "allowNull": false
                    },
                    "amountInCrypto": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amountInCrypto",
                        "allowNull": false
                    },
                    "confirmedAmountInUsd": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "confirmedAmountInUsd",
                        "allowNull": true
                    },
                    "confirmedAmountInCrypto": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "confirmedAmountInCrypto",
                        "allowNull": true
                    },
                    "rate": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "rate",
                        "allowNull": false
                    },
                    "status": {
                        "type": Sequelize.STRING,
                        "field": "status",
                        "allowNull": false
                    },
                    "reference": {
                        "type": Sequelize.STRING,
                        "field": "reference",
                        "unique": true,
                        "allowNull": false
                    },
                    "metaData": {
                        "type": Sequelize.JSON,
                        "field": "metaData",
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "transfers",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "cryptoId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "field": "cryptoId",
                        "references": {
                            "model": "cryptos",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "transferableType": {
                        "type": Sequelize.STRING,
                        "field": "transferableType",
                        "allowNull": false
                    },
                    "transferableId": {
                        "type": Sequelize.INTEGER,
                        "field": "transferableId",
                        "allowNull": false
                    },
                    "txId": {
                        "type": Sequelize.STRING,
                        "field": "txId",
                        "allowNull": true
                    },
                    "amount": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amount",
                        "allowNull": false
                    },
                    "fee": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "fee",
                        "allowNull": false
                    },
                    "address": {
                        "type": Sequelize.STRING,
                        "field": "address",
                        "allowNull": false
                    },
                    "status": {
                        "type": Sequelize.STRING,
                        "field": "status",
                        "allowNull": false
                    },
                    "memo": {
                        "type": Sequelize.TEXT,
                        "field": "memo",
                        "allowNull": true
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "crypto_wallet_histories",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "cryptoWalletId": {
                        "type": Sequelize.INTEGER,
                        "field": "cryptoWalletId",
                        "references": {
                            "model": "crypto_wallets",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "transactionId": {
                        "type": Sequelize.INTEGER,
                        "field": "transactionId",
                        "references": {
                            "model": "transactions",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "previousBalance": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "previousBalance",
                        "allowNull": false
                    },
                    "currentBalance": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "currentBalance",
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "CryptoWalletId": {
                        "type": Sequelize.INTEGER,
                        "field": "CryptoWalletId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "crypto_wallets",
                            "key": "id"
                        },
                        "allowNull": true
                    },
                    "TransactionId": {
                        "type": Sequelize.INTEGER,
                        "field": "TransactionId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "transactions",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "crypto_wallet_transactions",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true
                    },
                    "uuid": {
                        "type": Sequelize.UUID,
                        "field": "uuid",
                        "defaultValue": Sequelize.UUIDV4,
                        "unique": true,
                        "allowNull": false
                    },
                    "transactionId": {
                        "type": Sequelize.INTEGER,
                        "field": "transactionId",
                        "references": {
                            "model": "transactions",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "cryptoWalletId": {
                        "type": Sequelize.INTEGER,
                        "field": "cryptoWalletId",
                        "references": {
                            "model": "crypto_wallets",
                            "key": "id"
                        },
                        "allowNull": false
                    },
                    "amount": {
                        "type": Sequelize.DECIMAL(45, 25),
                        "field": "amount",
                        "allowNull": false
                    },
                    "type": {
                        "type": Sequelize.STRING,
                        "field": "type",
                        "allowNull": false
                    },
                    "status": {
                        "type": Sequelize.STRING,
                        "field": "status",
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "CryptoWalletId": {
                        "type": Sequelize.INTEGER,
                        "field": "CryptoWalletId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "crypto_wallets",
                            "key": "id"
                        },
                        "allowNull": true
                    },
                    "TransactionId": {
                        "type": Sequelize.INTEGER,
                        "field": "TransactionId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "transactions",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "addresses",
                ["address"],
                {
                    "indexName": "addresses_address",
                    "name": "addresses_address",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "addresses",
                ["cryptoId"],
                {
                    "indexName": "addresses_crypto_id",
                    "name": "addresses_crypto_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "addresses",
                ["uuid"],
                {
                    "indexName": "addresses_uuid",
                    "name": "addresses_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "addresses",
                ["addressableId"],
                {
                    "indexName": "addresses_addressable_id",
                    "name": "addresses_addressable_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "addresses",
                ["addressableType", "addressableId"],
                {
                    "indexName": "addresses_addressable_type_addressable_id",
                    "name": "addresses_addressable_type_addressable_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "cryptos",
                ["uuid"],
                {
                    "indexName": "cryptos_uuid",
                    "name": "cryptos_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "cryptos",
                ["slug"],
                {
                    "indexName": "cryptos_slug",
                    "name": "cryptos_slug",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "cryptos",
                ["isActive"],
                {
                    "indexName": "cryptos_is_active",
                    "name": "cryptos_is_active",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallets",
                ["clientId"],
                {
                    "indexName": "crypto_wallets_client_id",
                    "name": "crypto_wallets_client_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallets",
                ["cryptoId"],
                {
                    "indexName": "crypto_wallets_crypto_id",
                    "name": "crypto_wallets_crypto_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallets",
                ["uuid"],
                {
                    "indexName": "crypto_wallets_uuid",
                    "name": "crypto_wallets_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallets",
                ["clientId", "cryptoId"],
                {
                    "indexName": "crypto_wallets_client_id_crypto_id",
                    "name": "crypto_wallets_client_id_crypto_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_links",
                ["reference"],
                {
                    "indexName": "payment_links_reference",
                    "name": "payment_links_reference",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_links",
                ["uuid"],
                {
                    "indexName": "payment_links_uuid",
                    "name": "payment_links_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_link_transactions",
                ["transactionId"],
                {
                    "indexName": "payment_link_transactions_transaction_id",
                    "name": "payment_link_transactions_transaction_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_link_transactions",
                ["paymentLinkId"],
                {
                    "indexName": "payment_link_transactions_payment_link_id",
                    "name": "payment_link_transactions_payment_link_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_link_transactions",
                ["cryptoWalletId"],
                {
                    "indexName": "payment_link_transactions_crypto_wallet_id",
                    "name": "payment_link_transactions_crypto_wallet_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_link_transactions",
                ["uuid"],
                {
                    "indexName": "payment_link_transactions_uuid",
                    "name": "payment_link_transactions_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_pages",
                ["reference"],
                {
                    "indexName": "payment_pages_reference",
                    "name": "payment_pages_reference",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_pages",
                ["uuid"],
                {
                    "indexName": "payment_pages_uuid",
                    "name": "payment_pages_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_page_transactions",
                ["transactionId"],
                {
                    "indexName": "payment_page_transactions_transaction_id",
                    "name": "payment_page_transactions_transaction_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_page_transactions",
                ["paymentPageId"],
                {
                    "indexName": "payment_page_transactions_payment_page_id",
                    "name": "payment_page_transactions_payment_page_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_page_transactions",
                ["cryptoWalletId"],
                {
                    "indexName": "payment_page_transactions_crypto_wallet_id",
                    "name": "payment_page_transactions_crypto_wallet_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "payment_page_transactions",
                ["uuid"],
                {
                    "indexName": "payment_page_transactions_uuid",
                    "name": "payment_page_transactions_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transactions",
                ["cryptoId"],
                {
                    "indexName": "transactions_crypto_id",
                    "name": "transactions_crypto_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transactions",
                ["clientId"],
                {
                    "indexName": "transactions_client_id",
                    "name": "transactions_client_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transactions",
                ["uuid"],
                {
                    "indexName": "transactions_uuid",
                    "name": "transactions_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transactions",
                ["transferableType"],
                {
                    "indexName": "transactions_transferable_type",
                    "name": "transactions_transferable_type",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transactions",
                ["cryptoId", "transferableType"],
                {
                    "indexName": "transactions_crypto_id_transferable_type",
                    "name": "transactions_crypto_id_transferable_type",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transfers",
                ["txId"],
                {
                    "indexName": "transfers_tx_id",
                    "name": "transfers_tx_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transfers",
                ["cryptoId"],
                {
                    "indexName": "transfers_crypto_id",
                    "name": "transfers_crypto_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transfers",
                ["uuid"],
                {
                    "indexName": "transfers_uuid",
                    "name": "transfers_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transfers",
                ["address"],
                {
                    "indexName": "transfers_address",
                    "name": "transfers_address",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transfers",
                ["transferableId"],
                {
                    "indexName": "transfers_transferable_id",
                    "name": "transfers_transferable_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "transfers",
                ["transferableType", "transferableId"],
                {
                    "indexName": "transfers_transferable_type_transferable_id",
                    "name": "transfers_transferable_type_transferable_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallet_histories",
                ["cryptoWalletId"],
                {
                    "indexName": "crypto_wallet_histories_crypto_wallet_id",
                    "name": "crypto_wallet_histories_crypto_wallet_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallet_histories",
                ["transactionId"],
                {
                    "indexName": "crypto_wallet_histories_transaction_id",
                    "name": "crypto_wallet_histories_transaction_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallet_transactions",
                ["transactionId"],
                {
                    "indexName": "crypto_wallet_transactions_transaction_id",
                    "name": "crypto_wallet_transactions_transaction_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallet_transactions",
                ["cryptoWalletId"],
                {
                    "indexName": "crypto_wallet_transactions_crypto_wallet_id",
                    "name": "crypto_wallet_transactions_crypto_wallet_id",
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "crypto_wallet_transactions",
                ["uuid"],
                {
                    "indexName": "crypto_wallet_transactions_uuid",
                    "name": "crypto_wallet_transactions_uuid",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["addresses", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["cryptos", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["crypto_wallets", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["payment_links", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["payment_link_transactions", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["payment_pages", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["payment_page_transactions", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["transactions", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["transfers", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["crypto_wallet_histories", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["crypto_wallet_transactions", {
                transaction: transaction
            }]
        }
    ];
};

module.exports = {
    pos: 0,
    useTransaction: true,
    execute: function(queryInterface, Sequelize, _commands)
    {
        var index = this.pos;
        function run(transaction) {
            const commands = _commands(transaction);
            return new Promise(function(resolve, reject) {
                function next() {
                    if (index < commands.length)
                    {
                        let command = commands[index];
                        console.log("[#"+index+"] execute: " + command.fn);
                        index++;
                        queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                    }
                    else
                        resolve();
                }
                next();
            });
        }
        if (this.useTransaction) {
            return queryInterface.sequelize.transaction(run);
        } else {
            return run(null);
        }
    },
    up: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, migrationCommands);
    },
    down: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, rollbackCommands);
    },
    info: info
};
