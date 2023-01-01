const availableCryptoSymbol = {
  btc: 'BTC',
  eth: 'ETH',
  usdt: 'USDT',
}

const cryptoSmallestUnits = {
  btc: 1000000, // Satoshi
  eth: 1000000000000000000, // Wei: Threshold sends gas price in wei for ETH
}

module.exports = { availableCryptoSymbol, cryptoSmallestUnits }
