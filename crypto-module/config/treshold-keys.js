module.exports = {
      sandbox: {
        url: process.env.TRESHOLD_SANDBOX_URL,
        BTC: {
          hot:{
            walletId: process.env.TRESHOLD_BTC_HOT_WALLET_ID,
            key: process.env.TRESHOLD_BTC_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_BTC_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_BTC_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_BTC_COLD_WALLET_ID,
            key: process.env.TRESHOLD_BTC_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_BTC_COLD_WALLET_SECRET,
          },
          decimal: 8,
          feeDecimal: 8,
          parentSymbol: 'BTC'
        },
        ETH: {
          hot:{
            walletId: process.env.TRESHOLD_ETH_HOT_WALLET_ID,
            key: process.env.TRESHOLD_ETH_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_ETH_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_ETH_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_ETH_COLD_WALLET_ID,
            key: process.env.TRESHOLD_ETH_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_ETH_COLD_WALLET_SECRET,
          },
          decimal: 18,
          feeDecimal: 9,
          parentSymbol: 'ETH'
        },
        BNB: {
          hot:{
            walletId: process.env.TRESHOLD_BNB_HOT_WALLET_ID,
            key: process.env.TRESHOLD_BNB_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_BNB_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_BNB_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_BNB_COLD_WALLET_ID,
            key: process.env.TRESHOLD_BNB_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_BNB_COLD_WALLET_SECRET,
          },
          decimal: 18,
          feeDecimal: 18,
          parentSymbol: 'BNB',
          memo: 128
        },
        BSC: {
          hot:{
            walletId: process.env.TRESHOLD_BSC_HOT_WALLET_ID,
            key: process.env.TRESHOLD_BSC_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_BSC_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_BSC_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_BSC_COLD_WALLET_ID,
            key: process.env.TRESHOLD_BSC_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_BSC_COLD_WALLET_SECRET,
          },
          decimal: 18,
          feeDecimal: 18,
          parentSymbol: 'BSC'
        },
        TRX: {
          hot:{
            walletId: process.env.TRESHOLD_TRX_HOT_WALLET_ID,
            key: process.env.TRESHOLD_TRX_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_TRX_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_TRX_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_TRX_COLD_WALLET_ID,
            key: process.env.TRESHOLD_TRX_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_TRX_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'TRX',
        },
        MATIC: {
          hot:{
            walletId: process.env.TRESHOLD_MATIC_HOT_WALLET_ID,
            key: process.env.TRESHOLD_MATIC_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_MATIC_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_MATIC_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_MATIC_COLD_WALLET_ID,
            key: process.env.TRESHOLD_MATIC_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_MATIC_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'MATIC',
        },
        USDT_ETH: {
          hot:{
            walletId: process.env.TRESHOLD_USDT_ETH_HOT_WALLET_ID,
            key: process.env.TRESHOLD_USDT_ETH_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_USDT_ETH_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_USDT_ETH_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_USDT_ETH_COLD_WALLET_ID,
            key: process.env.TRESHOLD_USDT_ETH_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_USDT_ETH_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'ETH',
        },
        USDT_BEP20: {
          hot:{
            walletId: process.env.TRESHOLD_USDT_BEP20_HOT_WALLET_ID,
            key: process.env.TRESHOLD_USDT_BEP20_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_USDT_BEP20_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_USDT_BEP20_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_USDT_BEP20_COLD_WALLET_ID,
            key: process.env.TRESHOLD_USDT_BEP20_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_USDT_BEP20_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'BSC',
        },
        USDT_TRC20: {
          hot:{
            walletId: process.env.TRESHOLD_USDT_TRC20_HOT_WALLET_ID,
            key: process.env.TRESHOLD_USDT_TRC20_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_USDT_TRC20_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_USDT_TRC20_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_USDT_TRC20_COLD_WALLET_ID,
            key: process.env.TRESHOLD_USDT_TRC20_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_USDT_TRC20_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'TRX',
        },
        USDC_MATIC: {
          hot:{
            walletId: process.env.TRESHOLD_USDC_MATIC_HOT_WALLET_ID,
            key: process.env.TRESHOLD_USDC_MATIC_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_USDC_MATIC_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_USDC_MATIC_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_USDC_MATIC_COLD_WALLET_ID,
            key: process.env.TRESHOLD_USDC_MATIC_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_USDC_MATIC_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'MATIC',
        },
        DAI_MATIC: {
          hot:{
            walletId: process.env.TRESHOLD_DAI_MATIC_HOT_WALLET_ID,
            key: process.env.TRESHOLD_DAI_MATIC_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_DAI_MATIC_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_DAI_MATIC_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_DAI_MATIC_COLD_WALLET_ID,
            key: process.env.TRESHOLD_DAI_MATIC_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_DAI_MATIC_COLD_WALLET_SECRET,
          },
          decimal: 18,
          feeDecimal: 18,
          parentSymbol: 'MATIC',
        },
        BUSD_MATIC: {
          hot:{
            walletId: process.env.TRESHOLD_BUSD_MATIC_HOT_WALLET_ID,
            key: process.env.TRESHOLD_BUSD_MATIC_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_BUSD_MATIC_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_BUSD_MATIC_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_BUSD_MATIC_COLD_WALLET_ID,
            key: process.env.TRESHOLD_BUSD_MATIC_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_BUSD_MATIC_COLD_WALLET_SECRET,
          },
          decimal: 18,
          feeDecimal: 18,
          parentSymbol: 'MATIC',
        },
        BUSD_BEP20: {
          hot:{
            walletId: process.env.TRESHOLD_BUSD_BEP20_HOT_WALLET_ID,
            key: process.env.TRESHOLD_BUSD_BEP20_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_BUSD_BEP20_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_BUSD_BEP20_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_BUSD_BEP20_COLD_WALLET_ID,
            key: process.env.TRESHOLD_BUSD_BEP20_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_BUSD_BEP20_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'BSC',
        },
        USDC_BEP20: {
          hot:{
            walletId: process.env.TRESHOLD_USDC_BEP20_HOT_WALLET_ID,
            key: process.env.TRESHOLD_USDC_BEP20_HOT_WALLET_KEY,
            secret: process.env.TRESHOLD_USDC_BEP20_HOT_WALLET_SECRET,
            prefix: process.env.TRESHOLD_USDC_BEP20_HOT_WALLET_PREFIX
          },
          cold:{
            walletId: process.env.TRESHOLD_USDC_BEP20_COLD_WALLET_ID,
            key: process.env.TRESHOLD_USDC_BEP20_COLD_WALLET_KEY,
            secret: process.env.TRESHOLD_USDC_BEP20_COLD_WALLET_SECRET,
          },
          decimal: 6,
          feeDecimal: 6,
          parentSymbol: 'BSC',
        },
      },
      live: {
        url: process.env.TRESHOLD_LIVE_URL,
        BTC: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_BTC_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BTC_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BTC_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_BTC_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_BTC_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BTC_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BTC_COLD_WALLET_SECRET,
            },
            decimal: 8,
            feeDecimal: 8,
            parentSymbol: 'BTC'
          },
          ETH: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_ETH_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_ETH_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_ETH_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_ETH_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_ETH_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_ETH_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_ETH_COLD_WALLET_SECRET,
            },
            decimal: 18,
            feeDecimal: 9,
            parentSymbol: 'ETH'
          },
          BNB: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_BNB_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BNB_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BNB_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_BNB_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_BNB_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BNB_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BNB_COLD_WALLET_SECRET,
            },
            decimal: 18,
            feeDecimal: 18,
            parentSymbol: 'BNB',
            memo: 128
          },
          BSC: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_BSC_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BSC_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BSC_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_BSC_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_BSC_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BSC_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BSC_COLD_WALLET_SECRET,
            },
            decimal: 18,
            feeDecimal: 18,
            parentSymbol: 'BSC'
          },
          TRX: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_TRX_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_TRX_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_TRX_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_TRX_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_TRX_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_TRX_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_TRX_COLD_WALLET_SECRET,
            },
            decimal: 6,
            feeDecimal: 6,
            parentSymbol: 'TRX',
          },
          MATIC: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_MATIC_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_MATIC_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_MATIC_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_MATIC_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_MATIC_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_MATIC_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_MATIC_COLD_WALLET_SECRET,
            },
            decimal: 6,
            feeDecimal: 6,
            parentSymbol: 'MATIC',
          },
          USDT_BEP20: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_USDT_BEP20_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDT_BEP20_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDT_BEP20_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_USDT_BEP20_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_USDT_BEP20_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDT_BEP20_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDT_BEP20_COLD_WALLET_SECRET,
            },
            decimal: 6,
            feeDecimal: 6,
            parentSymbol: 'BSC',
          },
          USDT_TRC20: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_USDT_TRC20_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDT_TRC20_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDT_TRC20_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_USDT_TRC20_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_USDT_TRC20_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDT_TRC20_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDT_TRC20_COLD_WALLET_SECRET,
            },
            decimal: 6,
            feeDecimal: 6,
            parentSymbol: 'TRX',
          },
          USDC_MATIC: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_USDC_MATIC_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDC_MATIC_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDC_MATIC_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_USDC_MATIC_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_USDC_MATIC_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDC_MATIC_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDC_MATIC_COLD_WALLET_SECRET,
            },
            decimal: 6,
            feeDecimal: 6,
            parentSymbol: 'MATIC',
          },
          DAI_MATIC: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_DAI_MATIC_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_DAI_MATIC_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_DAI_MATIC_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_DAI_MATIC_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_DAI_MATIC_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_DAI_MATIC_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_DAI_MATIC_COLD_WALLET_SECRET,
            },
            decimal: 18,
            feeDecimal: 18,
            parentSymbol: 'MATIC',
          },
          BUSD_MATIC: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_BUSD_MATIC_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BUSD_MATIC_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BUSD_MATIC_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_BUSD_MATIC_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_BUSD_MATIC_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BUSD_MATIC_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BUSD_MATIC_COLD_WALLET_SECRET,
            },
            decimal: 18,
            feeDecimal: 18,
            parentSymbol: 'MATIC',
          },
          BUSD_BEP20: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_BUSD_BEP20_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BUSD_BEP20_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BUSD_BEP20_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_BUSD_BEP20_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_BUSD_BEP20_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_BUSD_BEP20_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_BUSD_BEP20_COLD_WALLET_SECRET,
            },
            decimal: 6,
            feeDecimal: 6,
            parentSymbol: 'BSC',
          },
          USDC_BEP20: {
            hot:{
              walletId: process.env.TRESHOLD_LIVE_USDC_BEP20_HOT_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDC_BEP20_HOT_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDC_BEP20_HOT_WALLET_SECRET,
              prefix: process.env.TRESHOLD_LIVE_USDC_BEP20_HOT_WALLET_PREFIX
            },
            cold:{
              walletId: process.env.TRESHOLD_LIVE_USDC_BEP20_COLD_WALLET_ID,
              key: process.env.TRESHOLD_LIVE_USDC_BEP20_COLD_WALLET_KEY,
              secret: process.env.TRESHOLD_LIVE_USDC_BEP20_COLD_WALLET_SECRET,
            },
            decimal: 6,
            feeDecimal: 6,
            parentSymbol: 'BSC',
          },
      }
  }