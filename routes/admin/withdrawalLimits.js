const express = require('express');
const { authorize } = require('../../middleware/index');
const Role = require('../../middleware/role');

const router = express.Router();

const withdrawalLimitsController = require('../../controllers/admin/withdrawalLimits');

router.get('/', authorize([Role.SuperAdmin, Role.Admin]), withdrawalLimitsController.getWithdrawalLimits);
router.get('/:id', authorize([Role.SuperAdmin, Role.Admin]), withdrawalLimitsController.getWithdrawalLimitById);
router.post('/', authorize([Role.SuperAdmin, Role.Admin]), withdrawalLimitsController.createWithdrawalLimit);
router.patch('/update/:id', authorize([Role.SuperAdmin, Role.Admin]), withdrawalLimitsController.updateWithdrawalLimit);

module.exports = router;