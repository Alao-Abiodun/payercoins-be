const express = require("express");
const { authorize } = require("../../middleware/index");
const Role = require("../../middleware/role");
const { validateBodySchema } = require("../../utils/validations");
const {
  completeDepositTransaction,
  initiateWalletDepositTransaction,
  verifyWalletDeposit,
} = require("../../utils/validations/completeDeposit");

const router = express.Router();

const {
  get,
  initiateWalletAddressUpdate,
  processUpdate,
} = require("../../controllers/admin/withdrawal-wallets");

const {
  updateRate,
  completeCryptoDepositTransaction,
  getAllManuallyCompletedDeposits,
  initiateWalletDeposit,
  completeWalletDeposit,
} = require("../../controllers/admin/crypto");

router.get(
  "/withdrawal-wallets/:env",
  authorize([Role.SuperAdmin, Role.Admin]),
  get
);
router.post(
  "/withdrawal-wallets/:env",
  authorize(Role.SuperAdmin),
  initiateWalletAddressUpdate
);
router.post(
  "/withdrawal-wallets/process-update/:env",
  authorize(Role.SuperAdmin),
  processUpdate
);

router.put(
  "/deposit/:transactionId",
  validateBodySchema(completeDepositTransaction),
  authorize([Role.SuperAdmin, Role.Admin]),
  completeCryptoDepositTransaction
);
router.post(
  "/wallets/deposit/initiate",
  validateBodySchema(initiateWalletDepositTransaction),
  authorize([Role.SuperAdmin, Role.Admin]),
  initiateWalletDeposit
);
router.put(
  "/deposit-wallets/verify",
  validateBodySchema(verifyWalletDeposit),
  authorize([Role.SuperAdmin, Role.Admin]),
  completeWalletDeposit
);
router.get(
  "/deposit",
  authorize([Role.SuperAdmin, Role.Admin]),
  getAllManuallyCompletedDeposits
);

router.post("/rate/:env", /*authorize(Role.SuperAdmin),*/ updateRate);

module.exports = router;
