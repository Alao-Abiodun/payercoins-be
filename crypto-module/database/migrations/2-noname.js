'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "memo" to table "addresses"
 * addColumn "address" to table "crypto_wallet_transactions"
 * addColumn "memo" to table "crypto_wallet_transactions"
 * addColumn "fee" to table "crypto_wallet_transactions"
 * changeColumn "cryptoWalletId" on table "crypto_wallet_transactions"
 * changeColumn "transactionId" on table "crypto_wallet_transactions"
 *
 **/

var info = {
    "revision": 2,
    "name": "noname",
    "created": "2021-09-28T11:20:00.700Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "addColumn",
            params: [
                "addresses",
                "memo",
                {
                    "type": Sequelize.STRING,
                    "field": "memo",
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
                "address",
                {
                    "type": Sequelize.STRING,
                    "field": "address",
                    "allowNull": false
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
                "memo",
                {
                    "type": Sequelize.STRING,
                    "field": "memo",
                    "allowNull": false
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
                "fee",
                {
                    "type": Sequelize.DECIMAL(45, 25),
                    "field": "fee",
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
var rollbackCommands = function(transaction) {
    return [{
            fn: "removeColumn",
            params: [
                "addresses",
                "memo",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "crypto_wallet_transactions",
                "address",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "crypto_wallet_transactions",
                "memo",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "crypto_wallet_transactions",
                "fee",
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
