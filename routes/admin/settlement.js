const express = require("express");
const { authorize } = require("../../middleware/index");
const Role = require("../../middleware/role");

const router = express.Router();

const settlementController = require("../../controllers/admin/settlements");

router.get(
  "/",
  authorize([Role.SuperAdmin, Role.Admin]),
  settlementController.fetchWithdrawalRequests
);
router.get(
  "/pending",
  authorize([Role.SuperAdmin, Role.Admin]),
  settlementController.fetchPendingWithdrawalRequests
);
router.get(
  "/processing",
  authorize([Role.SuperAdmin, Role.Admin]),
  settlementController.fetchProcessingWithdrawalRequests
);
router.get(
  "/completed",
  authorize([Role.SuperAdmin, Role.Admin]),
  settlementController.fetchCompletedWithdrawalRequests
);

router.patch(
  "/:id/complete",
  authorize([Role.SuperAdmin, Role.Admin]),
  settlementController.processWithdrawalRequest
);
router.patch(
  "/:id/decline",
  authorize([Role.SuperAdmin, Role.Admin]),
  settlementController.DeclineWithdrawalRequest
);

router.get("/single/:id", settlementController.fetchBankDetails);

router.patch(
  "/retry/:id",
  authorize([Role.SuperAdmin, Role.Admin]),
  settlementController.retryFiatWithdrawal
);

module.exports = router;
