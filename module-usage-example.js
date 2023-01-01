const user1 = { id: '48eaca31-ee2b-4b8d-9f53-3e73d0876aee', name: 'John Doe', state: 'test' }
const user = { id: '926674d7-1a17-4fc4-b8b7-517d1f2f942c', name: 'Toheeb Olayemi', state: 'test' }

const cryptoModuleInSandbox = require('./crypto-module')('sandbox')

const test = async () => {
    // await cryptoModuleInSandbox.getTransactionFee('ETH')

    // const cryptos = await cryptoModuleInSandbox.getCryptos()
    // console.log(cryptos)

    // const wallets = await cryptoModuleInSandbox.createWallets(user.id, ['usdt-trx'])
    // console.log(wallets)

    // const address = await cryptoModuleInSandbox.getAddressesForWallet(user.id, 'ethereum')
    // console.log(address)

     const res = await cryptoModuleInSandbox.generatePaymentLink(user.id, ['ethereum'], 100, 'fixed', 3600, 'api', { email: 'olayemitoheeblekan@gmail.com', description: 'ink to sell car', name: 'Toheeb' })
     console.log(res)

    // const paymentPage = await cryptoModuleInSandbox.generatePaymentPage(user.id, ['usdt-trx'], 400, 'fixed', { description: 'test description', name: 'test name' })
    // console.log(paymentPage)

    //const send = await cryptoModuleInSandbox.generatePaymentLink(user.id, 'ethereum', 0.001, 0.0005, '0x9e33C37E0cF7Da2b3b00e7F50f0e7383701988D4')
    //console.log(send)
    
    // const paymentPages = await cryptoModuleInSandbox.getPaymentPages(user.id)
    // console.log(paymentPages)

    // const paymentPage = await cryptoModuleInSandbox.getPaymentPage(
    //     '114b2822e6162471c28fd1a8fce132fe24ade620f3db984ddce8cc60614cf5aace265dcca16a99f8'
    // )
    // console.log(paymentPage)

    // const paymentPages = await cryptoModuleInSandbox.getPaymentPageTransactions('e25c71dcff807d62a150d6037c7704e6a1f08d94a21f9e9ae1908940fd3a537932e81678deeecb2f')
    // console.log(paymentPages)
}

test()
// const wallets = cryptoModuleInSandbox.generatePaymentLink(user.id, ['ethereum', 'bitcoin'])

// const wallets = await cryptoModuleInSandbox.getWallets(user.id, ['ethereum', 'usdt'])
// const wallets = await cryptoModuleInSandbox.createWallets(user.id, ['ethereum'])
// console.log(wallets)

// console.log(wallets.wallets[0].crypto)

// const res = await cryptoModuleInSandbox.generatePaymentLink(user.id, ['ethereum'], 300, 'fixed', 3600, 'web', {page: 'Sell Car', description: 'ink to sell car'})
// console.log(res)

//     const payment = await cryptoModuleInSandbox.getPaymentLink(user.id, '1081f3012871c881e262c183e5c1e1ef0d3d4a8b98305f4cde04533bfa7b6ada60b1c6875399a28f')
// console.log(payment)