const Settings = require("../../models/settingsModel"),
  Rate = require("../../models/rateModel"),
  catchAsync = require("../../utils/libs/catchAsync"),
  AppError = require("../../utils/libs/appError"),
  { successResMsg } = require("../../utils/libs/response"),
  { createWallet } = require("../../utils/libs/cryptoModule");

const LiveBox = require("../../crypto-module")("live");
const SandBox = require("../../crypto-module")("sandbox");

exports.getCryptos = async (req, res, next) => {
  try {
    const { cryptos } = await LiveBox.getCryptos();
    const sandBox = await SandBox.getCryptos();

    const crypto = {
      live: cryptos,
      sandbox: sandBox.cryptos,
    };
    return res.status(200).json({
      status: "success",
      crypto,
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.createNewWallet = catchAsync(async (req, res, next) => {
  try {
    const { wallet } = req.body;
    let status = createWallet(req.user.uuid, wallet);
    if (!status) {
      return next(
        new AppError(`We are unable to create your ${wallet} wallet`, 400)
      );
    }

    return successResMsg(res, 200, {
      message: `${wallet} wallet has been created successfully`,
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getWallets = catchAsync(async (req, res, next) => {
  try {
    const { wallets } = await req.cryptoBox.getWalletsByClientID(req.user.uuid);

    return res.status(200).json({
      status: "success",
      wallets: wallets,
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getActivatedWallets = catchAsync(async (req, res, next) => {
  try {
    const { wallets } = await req.cryptoBox.getWallets(req.user.uuid, [
      ...req.wallets,
    ]);

    return res.status(200).json({
      status: "success",
      wallets: wallets,
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getUserWalletBalance = catchAsync(async (req, res, next) => {
  try {
    let wallet = req.params.wallet;
    const { wallets } = await req.cryptoBox.getWallets(req.user.uuid, [wallet]);

    return successResMsg(res, 200, {
      balance: wallets[0].balance,
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getEnvironment = catchAsync(async (req, res, next) => {
  try {
    let userEnv = await Settings.findOne({ user: req.user._id });

    if (!userEnv)
      return next(
        new AppError("We are unable to get your current environment", 400)
      );

    return successResMsg(res, 200, {
      environment: userEnv.environment,
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.updateEnvironment = catchAsync(async (req, res, next) => {
  try {
    const { environment } = req.body;
    if (!environment)
      return next(new AppError("User environment is required", 400));

    let updateEnv = await Settings.updateOne(
      { user: req.user._id },
      {
        environment: environment,
      }
    );

    if (!updateEnv.n)
      return next(
        new AppError("We are unable to update your environment", 400)
      );

    return successResMsg(res, 200, {
      message: `Your environment has been updated to ${environment}`,
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.activateWallet = catchAsync(async (req, res, next) => {
  try {
    const { wallet } = req.body;
    req.wallets.push(wallet);
    let updateWallets = await Settings.updateOne(
      { user: req.user._id },
      {
        wallets: [...new Set(req.wallets)], //make sure the array only contains unique values
      }
    );

    if (!updateWallets.n)
      return next(new AppError(`We are unable to activate ${wallet}`, 400));

    return successResMsg(res, 200, {
      message: `${wallet} has been activated`,
    });
  } catch (e) {
    return next(new AppError(`We are unable to activate ${wallet}`, 400));
  }
});

exports.deactivateWallet = catchAsync(async (req, res, next) => {
  try {
    const { wallet } = req.body;

    if (req.wallets.length === 1)
      return next(new AppError(`You cannot deactivate your last wallet`, 400));

    let newWallet = req.wallets.filter((item) => item !== wallet);
    let updateWallets = await Settings.updateOne(
      { user: req.user._id },
      {
        wallets: newWallet,
      }
    );

    if (!updateWallets.n)
      return next(new AppError(`We are unable to deactivate ${wallet}`, 400));

    return successResMsg(res, 200, {
      message: `${wallet} has been deactivated`,
    });
  } catch (e) {
    return next(new AppError(`We are unable to deactivate ${wallet}`, 400));
  }
});

exports.getUserActivatedWallet = catchAsync(async (req, res, next) => {
  try {
    const { wallets } = await Settings.findOne({ user: req.user._id });

    if (!wallets)
      return next(new AppError("We are unable to find your wallets", 400));

    return successResMsg(res, 200, { wallets });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getUserActivatedWalletByPublicKey = catchAsync(
  async (req, res, next) => {
    try {
      const { wallets } = await Settings.findOne({ user: req.user._id });

      if (!wallets)
        return next(new AppError("We are unable to find your wallets", 400));

      const cryptos = [
        {
          id: 2,
          name: "Bitcoin",
          slug: "bitcoin",
          symbol: "BTC",
          img: "Bitcoin",
          classname: "accounts_img accounts_img-2",
          rate: "BTC",
          type: "BTC",
        },
        {
          id: 3,
          name: "Ethereum",
          slug: "ethereum",
          symbol: "ETH",
          img: "Ethereum",
          classname: "accounts_img accounts_img-3",
          rate: "ETH",
          type: "ETH",
        },
        // {
        //   id: 4,
        //   name: 'USDT (ERC20)',
        //   img: Tether,
        //   classname: 'accounts_img accounts_img-4',
        //   slug: 'usdt-eth',
        //   rate: 'USDT',
        //   symbol: 'USDT_ETH',
        //   type: 'ETH-USDT-ERC20',
        // },
        {
          id: 5,
          name: "USDT (TRC20)",
          slug: "usdt-trx",
          symbol: "USDT_TRC20",
          img: "Tether",
          classname: "accounts_img accounts_img-4",
          rate: "USDT",
          type: "USDT_TRX",
        },
        {
          id: 6,
          name: "USDT (BEP20)",
          slug: "usdt-bep",
          symbol: "USDT_BEP20",
          img: "Tether",
          classname: "accounts_img accounts_img-4",
          rate: "USDT",
          type: "BSC-USDT-BEP20",
        },
        {
          id: 7,
          name: "BUSD (BEP20)",
          slug: "busd-bep",
          symbol: "BUSD_BEP20",
          img: "Tether",
          classname: "accounts_img accounts_img-4",
          rate: "BUSD",
          type: "BSC-BUSD",
        },
        {
          id: 8,
          name: "USDC (BEP20)",
          slug: "usdc-bep",
          symbol: "USDC_BEP20",
          img: "Tether",
          classname: "accounts_img accounts_img-4",
          rate: "USDC",
          type: "BSC-USDC",
        },
      ];

      const walletFilter = cryptos.filter((crypto) => {
        const data = wallets.includes(crypto.slug);
        return data;
      });

      const activatedWallets = walletFilter.map((item) => {
        return {
          name: item.name,
          slug: item.slug,
          symbol: item.symbol,
        };
      });

      return successResMsg(res, 200, { activatedWallets });
    } catch (err) {
      return next(new AppError(err, 400));
    }
  }
);

exports.getWalletTransactions = catchAsync(async (req, res, next) => {
  try {
    const { wallet } = req.params;
    const { transactions } = await req.cryptoBox.getTransactionsForWallet(
      req.user.uuid,
      wallet
    );

    return successResMsg(res, 200, { transactions });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.getTransactions = catchAsync(async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const transactions = await req.cryptoBox.getClientTransactions(
      req.user.uuid,
      pageSize,
      page
    );

    return successResMsg(res, 200, transactions);
  } catch (err) {
    return next(new AppError(err, 400));
  }
});

exports.userWalletStaticAddress = catchAsync(async (req, res, next) => {
  try {
    const { wallet } = req.params;
    const { addresses } = await req.cryptoBox.getAddressesForWallet(
      req.user.uuid,
      wallet
    );
    if (addresses.length !== 0) {
      return successResMsg(res, 200, { address: addresses[0] }); //send the first object in the array
    } else {
      const { address } = await req.cryptoBox.createAddressForWallet(
        req.user.uuid,
        wallet
      );
      return successResMsg(res, 200, { address: address });
    }
  } catch (err) {
    //console.log(err);
    return next(new AppError(err, 400));
  }
});

exports.getRate = catchAsync(async (req, res, next) => {
  let owner = req.params.env;
  try {
    const { rates } = await Rate.findOne({ owner: owner });
    return successResMsg(res, 200, { rates });
  } catch (err) {
    //console.log(err);
    return next(new AppError(err, 400));
  }
});

exports.verifyCryptoAddress = catchAsync(async (req, res, next) => {
  try {
    const { address, walletSymbol } = req.body;
    let verifyAddress = await req.cryptoBox.verifyCryptoAddress(
      address,
      walletSymbol
    );
    if (!verifyAddress) {
      return next(new AppError("Invalid wallet address", 400));
    }
    return successResMsg(res, 200, {
      message: "Address is valid",
    });
  } catch (err) {
    return next(new AppError(err, 400));
  }
});
