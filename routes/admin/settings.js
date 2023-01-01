const express = require('express');
const { authorize } = require('../../middleware/index');
const Role = require('../../middleware/role');

const router = express.Router();

const { 
  updateFiatWithdrawalProvider,
  getFiatWithdrawalProvider
} = require('../../controllers/admin/settings');

router.post('/fiat-withdrawal', authorize(Role.SuperAdmin), updateFiatWithdrawalProvider);
router.get('/fiat-withdrawal', authorize(Role.SuperAdmin), getFiatWithdrawalProvider);

module.exports = router;
