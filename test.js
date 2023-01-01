/*const { createWallet, getCryptos } = require('./utils/libs/cryptoModule');

createWallet(2313);

getCryptos();
const LiveBox = require('./crypto-module')('live');
const SandBox = require('./crypto-module')('sandbox');

const UUID = require('uuid');

let id = UUID.v4();
console.log({id});

const createWallet = async (id) => {
  // const liveWallet = await LiveBox.createWallets(id, ['bitcoin', 'ethereum', 'usdt-eth']);
  const sandBoxWallet = await SandBox.createWallets(id, ['bitcoin', 'ethereum', 'usdt-eth']);

  console.log({liveWallet, sandBoxWallet});
  return wallet;
}

createWallet(id);


const slug  = require('./utils/libs/createPaymentSlug');

slug('Hello world').then(n => {
  console.log(n);

})*/
/*
const { getCryptosSlug } = require('./utils/libs/cryptoModule');

getCryptosSlug().then(data => {
  console.log(data);

})*/
// const crypto = require('crypto');

// function buildChecksum(params, secret, t, r, postData) {
//   const p = params || [];
//   p.push(`t=${t}`, `r=${r}`);
//   if (!!postData) {
//     if (typeof postData === 'string') {
//       p.push(postData);
//     } else {
//       p.push(JSON.stringify(postData));
//     }
//   }
//   p.sort();
//   p.push(`secret=${secret}`);
//   return crypto.createHash('sha256').update(p.join('&')).digest('hex');
// }
