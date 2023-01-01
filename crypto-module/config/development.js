const treshold = require('./treshold-keys')

module.exports = {
  db: {
    sandbox: {
      uri: process.env.CRYPTO_MODULE_DATABASE_URL_SANDBOX,
      sequelize: {
        url: process.env.CRYPTO_MODULE_DATABASE_URL_SANDBOX,
        use_env_variable: process.env.CRYPTO_MODULE_DATABASE_URL_SANDBOX,
        dialect: "postgres",
        logging: false,
        query: {
          nest: true,
          // raw: true,
          // plain: true
        }
      }
    },
    live: {
      uri: process.env.CRYPTO_MODULE_DATABASE_URL_LIVE,
      sequelize: {
        url: process.env.CRYPTO_MODULE_DATABASE_URL_LIVE,
        use_env_variable: process.env.CRYPTO_MODULE_DATABASE_URL_LIVE,
        dialect: "postgres",
        logging: false,
        query: {
          nest: true,
          // raw: true,
          // plain: true
        }
      }
    },
  },

  url: {
    sandbox: {
      paymentLinkUrl: process.env.SANBOX_PAYMENT_LINK_URL,
      paymentPageUrl: process.env.SANBOX_PAYMENT_PAGE_URL,
      apiPaymentUrl: process.env.SANBOX_API_PAYMENT_URL
    },
    live: {
      paymentLinkUrl: process.env.LIVE_PAYMENT_LINK_URL,
      paymentPageUrl: process.env.LIVE_PAYMENT_PAGE_URL,
      apiPaymentUrl: process.env.LIVE_API_PAYMENT_URL
    }
  },

  treshold: {
    ...treshold
  },

  coinmarketcap: {
    live: {
      url: process.env.COINMARKETCAP_URL,
      apiKey: process.env.COINMARKETCAP_API_KEY
    },
    sandbox: {
      url: process.env.COINMARKETCAP_URL,
      apiKey: process.env.COINMARKETCAP_API_KEY
    },
  },

  pusher: {
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER
  }
}