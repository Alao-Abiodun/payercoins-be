'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "TransactionId" from table "crypto_wallet_transactions"
 * removeColumn "CryptoWalletId" from table "crypto_wallet_transactions"
 * changeColumn "cryptoWalletId" on table "crypto_wallet_transactions"
 * changeColumn "transactionId" on table "crypto_wallet_transactions"
 *
 **/

var info = {
    "revision": 3,
    "name": "noname",
    "created": "2021-11-18T12:28:07.349Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "removeColumn",
            params: [
                "crypto_wallet_transactions",
                "TransactionId",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "crypto_wallet_transactions",
                "CryptoWalletId",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "crypto_wallet_transactions",
                "cryptoWalletId",
                {
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
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "crypto_wallet_transactions",
                "transactionId",
                {
                    "type": Sequelize.INTEGER,
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "field": "transactionId",
                    "references": {
                        "model": "transactions",
                        "key": "id"
                    },
                    "allowNull": false
                },
                {
                    transaction: transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "addColumn",
            params: [
                "crypto_wallet_transactions",
                "TransactionId",
                {
                    "type": Sequelize.INTEGER,
                    "field": "TransactionId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "transactions",
                        "key": "id"
                    },
                    "allowNull": true
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "crypto_wallet_transactions",
                "CryptoWalletId",
                {
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
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "crypto_wallet_transactions",
                "cryptoWalletId",
                {
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
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "crypto_wallet_transactions",
                "transactionId",
                {
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
                {
                    transaction: transaction
                }
            ]
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
