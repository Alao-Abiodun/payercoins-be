const express = require('express');
const { authorize } = require('../../middleware/index');
const Role = require('../../middleware/role');

const router = express.Router();

const accountsController = require('../../controllers/admin/accounts');

router.get('/individual', authorize([Role.SuperAdmin, Role.Admin]), accountsController.getIndividualAccounts);
router.get('/approved-business', authorize([Role.SuperAdmin, Role.Admin]), accountsController.getApprovedBusinesses);
router.get('/pending-business', authorize([Role.SuperAdmin, Role.Admin]), accountsController.getPendingBusinesses);
router.get('/:id', authorize([Role.SuperAdmin, Role.Admin]), accountsController.getUserProfile);
router.patch('/:id', authorize([Role.SuperAdmin, Role.Admin]), accountsController.UpdateUserProfile);
router.put('/approve-business/:id', authorize([Role.SuperAdmin, Role.Admin]), accountsController.verifyBusiness);
router.post('/decline-business/:id', authorize([Role.SuperAdmin, Role.Admin]), accountsController.rejectBusiness);
router.put('/block/:id', authorize([Role.SuperAdmin, Role.Admin]), accountsController.blockUser)
router.put('/unblock/:id', authorize([Role.SuperAdmin, Role.Admin]), accountsController.unBlockUser)
router.get('/stats/dashboard', authorize([Role.SuperAdmin, Role.Admin]), accountsController.getDashboardData)


module.exports = router;
