const express = require('express');
const { authorize } = require('../../middleware/index');
const Role = require('../../middleware/role');

const router = express.Router();

const paymentLinkController = require('../../controllers/admin/payment-link');


router.get('/', authorize([Role.SuperAdmin, Role.Admin]), paymentLinkController.getUsersPaymentLinks);
router.get('/:id', authorize([Role.SuperAdmin, Role.Admin]), paymentLinkController.getUserPaymentLinks);
router.get('/single/:paymentLinkId', authorize([Role.SuperAdmin, Role.Admin]), paymentLinkController.getUserPaymentLink);
router.get('/transactions/:paymentLinkId', authorize([Role.SuperAdmin, Role.Admin]), paymentLinkController.getPaymentLinkTransactions);
router.put('/disable/:paymentLinkId', authorize([Role.SuperAdmin, Role.Admin]), paymentLinkController.disablePaymentLink);

module.exports = router;