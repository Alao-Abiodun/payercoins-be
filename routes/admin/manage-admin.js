const express = require('express');
const { authorize } = require('../../middleware/index');
const Role = require('../../middleware/role');

const router = express.Router();

const { 
  addAdminUser,
  getAdminUsers,
  getAdminUser,
  blockAdminUser,
  unBlockAdminUser,
  deleteAdminUser,
} = require('../../controllers/admin/manage-admin');

router.post('/manage-admin', authorize([Role.SuperAdmin, Role.Admin]), addAdminUser);
router.patch('/manage-admin/:id/block', authorize(Role.SuperAdmin), blockAdminUser);
router.patch('manage-admin/:id/unblock', authorize(Role.SuperAdmin), unBlockAdminUser);
router.delete('manage-admin/:id', authorize(Role.SuperAdmin), deleteAdminUser);
router.get('manage-admin/', authorize(Role.SuperAdmin), getAdminUsers);
router.get('manage-admin/:id', authorize(Role.SuperAdmin), getAdminUser);

module.exports = router;