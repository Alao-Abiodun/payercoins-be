const cryptoRepository = require('../../src/repositories/crypto');
const config = require('../../config/index');

const seed = async () => {

    console.log('Seeding crypto data...');

    const livedatabase = require('../../database/models')({ environment: 'live' });

    await livedatabase.Crypto.destroy({ truncate : true, cascade: true })

    await cryptoRepository.create(livedatabase, {
        id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        slug: 'bitcoin',
        type: 'BTC',
        sign: 'B'
    });

    await cryptoRepository.create(livedatabase, {
        id: 2,
        name: 'Ethereum',
        symbol: 'ETH',
        slug: 'ethereum',
        type: 'ETH',
        sign: 'E'
    });

    await cryptoRepository.create(livedatabase, {
        id: 3,
        name: 'USD Tether (ERC20)',
        symbol: 'USDT_ETH',
        slug: 'usdt-eth',
        type: 'ETH-USDT-ERC20',
        sign: 'U'
    });

    await cryptoRepository.create(livedatabase, {
        id: 4,
        name: 'USD Tether (TRC20)',
        symbol: 'USDT_TRC20',
        slug: 'usdt-trx',
        type: 'TRX-USDT-TRC20',
        sign: 'U'
    });

    await cryptoRepository.create(livedatabase, {
        id: 5,
        name: 'USD Tether (BEP20)',
        symbol: 'USDT_BEP20',
        slug: 'usdt-bep',
        type: 'BEP-USDT-BEP20',
        sign: 'U'
    });

    await cryptoRepository.create(livedatabase, {
      id: 6,
      name: 'BUSD (BEP20)',
      symbol: 'BUSD_BEP20',
      slug: 'busd-bep',
      type: 'BEP-BUSD-BEP20',
      sign: 'U'
    });

    await cryptoRepository.create(livedatabase, {
      id: 7,
      name: 'USDC (BEP20)',
      symbol: 'USDC_BEP20',
      slug: 'usdc-bep',
      type: 'BEP-USDC-BEP20',
      sign: 'U'
    });

    /*await cryptoRepository.create(livedatabase, {
        id: 6,
        name: 'USDC (POLYGON)',
        symbol: 'USDC_MATIC',
        slug: 'usdc-matic',
        type: '',
        sign: 'U'
    });

    await cryptoRepository.create(livedatabase, {
        id: 7,
        name: 'DAI (POLYGON)',
        symbol: 'DAI_MATIC',
        slug: 'dai-matic',
        type: '',
        sign: 'D'
    });

    await cryptoRepository.create(livedatabase, {
        id: 8,
        name: 'BUSD (POLYGON)',
        symbol: 'BUSD_MATIC',
        slug: 'busd-matic',
        type: '',
        sign: 'U'
    });*/


    const sandboxdatabase = require('../../database/models')({ environment: 'sandbox' });

    await sandboxdatabase.Crypto.destroy({ truncate : true, cascade: true })

    await cryptoRepository.create(sandboxdatabase, {
        id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        slug: 'bitcoin',
        type: 'BTC',
        sign: 'B'
    });

    await cryptoRepository.create(sandboxdatabase, {
        id: 2,
        name: 'Ethereum',
        symbol: 'ETH',
        slug: 'ethereum',
        type: 'ETH',
        sign: 'E'
    });

    await cryptoRepository.create(sandboxdatabase, {
        id: 3,
        name: 'USD Tether (ERC20)',
        symbol: 'USDT_ETH',
        slug: 'usdt-eth',
        type: 'ETH-WUSDT(ERC20)',
        sign: 'U'
    });

    await cryptoRepository.create(sandboxdatabase, {
        id: 4,
        name: 'USD Tether (TRC20)',
        symbol: 'USDT_TRC20',
        slug: 'usdt-trx',
        type: 'TRC-WUSDT(TRC20)',
        sign: 'U'
    });

    await cryptoRepository.create(sandboxdatabase, {
        id: 5,
        name: 'USD Tether (BEP20)',
        symbol: 'USDT_BEP20',
        slug: 'usdt-bep',
        type: 'BEP-WUSDT(BEP20)',
        sign: 'U'
    });

    await cryptoRepository.create(sandboxdatabase, {
      id: 6,
      name: 'BUSD (BEP20)',
      symbol: 'BUSD_BEP20',
      slug: 'busd-bep',
      type: 'BEP-BUSD(BEP20)',
      sign: 'U'
    });

    await cryptoRepository.create(sandboxdatabase, {
      id: 7,
      name: 'USDC (BEP20)',
      symbol: 'USDC_BEP20',
      slug: 'usdc-bep',
      type: 'BEP-USDC(BEP20)',
      sign: 'U'
    });

    /*await cryptoRepository.create(sandboxdatabase, {
        id: 6,
        name: 'USDC (POLYGON)',
        symbol: 'USDC_MATIC',
        slug: 'usdc-matic',
        type: '',
        sign: 'U'
    });

    await cryptoRepository.create(sandboxdatabase, {
        id: 7,
        name: 'DAI (POLYGON)',
        symbol: 'DAI_MATIC',
        slug: 'dai-matic',
        type: '',
        sign: 'D'
    });

    await cryptoRepository.create(sandboxdatabase, {
        id: 8,
        name: 'BUSD (POLYGON)',
        symbol: 'BUSD_MATIC',
        slug: 'busd-matic',
        type: '',
        sign: 'U'
    });*/

    console.log('Seeding Completed');
}

// seed() - Never call this function directly.

const addNewCoin = async () => {

    console.log('Adding crypto data...');

    const livedatabase = require('../../database/models')({ environment: 'live' });

    await cryptoRepository.create(livedatabase, {
        id: 7, // update this ID and make sure it is unique
        name: 'USDC (BEP20)',
        symbol: 'USDC_BEP20',
        slug: 'usdc-bep',
        type: 'BEP-USDC-BEP20',
        sign: 'U'
    });

    // sandbox database

    const sandboxdatabase = require('../../database/models')({ environment: 'sandbox' });

    await cryptoRepository.create(sandboxdatabase, {
        id: 7, // update this ID and make sure it is unique
        name: 'USDC (BEP20)',
        symbol: 'USDC_BEP20',
        slug: 'usdc-bep',
        type: 'BEP-USDC(BEP20)',
        sign: 'U'
    });

    console.log('Coin added');
}

addNewCoin();