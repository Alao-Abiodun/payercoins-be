const LiveBox = require('../../crypto-module')('live');
const SandBox = require('../../crypto-module')('sandbox');

const createDefaultWallets = async UserId => {
  try {
    let wallets = await getCryptosSlug();
    const sandboxWallets = await SandBox.createWallets(UserId, wallets);
    const liveboxWallets = await LiveBox.createWallets(UserId, wallets);
    return ( sandboxWallets && liveboxWallets ) ? true : false;
  } catch(err) {
    //console.log(err);
    return false;
  }
}

const createWallet = async (UserId, wallet) => {
  try {
    const sandboxWallets = await SandBox.createWalletsIfDoesNotExist(UserId, [wallet]);
    const liveboxWallets = await LiveBox.createWalletsIfDoesNotExist(UserId, [wallet]);
    return ( sandboxWallets && liveboxWallets ) ? true : false;
  } catch(err) {
    //console.log(err);
    return false;
  }
}

const getCryptosSlug = async () => {
  const { cryptos } = await LiveBox.getCryptos();
  let slug = [];
  cryptos.map((crypto) => {
    slug.push(crypto.slug);
  })
  return slug;
}

const getDefaultActiveWallets = async () => {
  const cryptoSlugs = await getCryptosSlug();
  
  // Filter out bicoin and ethereum from the list of slugs
  const defaultActiveWallets = cryptoSlugs.filter(
    (slug) => slug !== "bitcoin" && slug !== "ethereum"
  );
  return defaultActiveWallets;
};

module.exports = {
    createDefaultWallets,
    createWallet,
    getCryptosSlug,
    getDefaultActiveWallets,
}