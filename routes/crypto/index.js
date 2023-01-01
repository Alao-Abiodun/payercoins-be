const express = require("express"),
  router = express.Router();

const { protect, validatePubKey } = require("../../controllers/authController");
const {
  getCryptos,
  getEnvironment,
  getWallets,
  getActivatedWallets,
  updateEnvironment,
  activateWallet,
  deactivateWallet,
  getUserActivatedWallet,
  getUserActivatedWalletByPublicKey,
  createNewWallet,
  getWalletTransactions,
  getTransactions,
  userWalletStaticAddress,
  getUserWalletBalance,
  getRate,
  verifyCryptoAddress,
} = require("../../controllers/crypto");

const {
  initiate,
  process,
  getFiatTransactions,
} = require("../../controllers/crypto/withdrawal");

router.get("/", getCryptos);
router.get("/environment", protect, getEnvironment);
router.get("/wallets", protect, getWallets);
router.get("/wallets/activated", protect, getActivatedWallets);
router.get("/user-wallet", protect, getUserActivatedWallet);

// fetch user activated wallet publicly
router.get(
  "/public/user-wallet",
  validatePubKey,
  getUserActivatedWalletByPublicKey
);

router.get("/transactions", protect, getTransactions);
router.get("/fiat/transactions", protect, getFiatTransactions);

router.get("/:wallet/transactions", protect, getWalletTransactions);
router.get("/:wallet/address", protect, userWalletStaticAddress);
router.get("/:wallet/balance", protect, getUserWalletBalance);

router.post("/environment", protect, updateEnvironment);

router.post("/wallet/activate", protect, activateWallet);
router.post("/wallet/deactivate", protect, deactivateWallet);
router.post("/wallet/create", protect, createNewWallet);

router.post("/withdrawal/initiate", protect, initiate);
router.post("/withdrawal/process", protect, process);

router.get("/rate/:env", getRate);

router.post("/address/verify", protect, verifyCryptoAddress);

module.exports = router;
