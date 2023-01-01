const authRouter = require('./auth'),
      manageAdminRouter  = require('./manage-admin'),
      manageAccountsRouter = require('./accounts'),
      managePaymentLinkRouter = require('./payment-link'),
      manageSettlement = require('./settlement'),
      manageWithdrawalLimit = require('./withdrawalLimits'),
      manageAdminSettings = require('./settings');


module.exports = (app) => {
  app.use('/api/v1/admin/auth', authRouter);
  app.use('/api/v1/admin', manageAdminRouter);
  app.use('/api/v1/admin/users', manageAccountsRouter);
  app.use('/api/v1/admin/payment-links', managePaymentLinkRouter);
  app.use('/api/v1/admin/crypto', require('./crypto'));
  app.use('/api/v1/admin/settlements', manageSettlement);
  app.use('/api/v1/admin/withdrawal-limits', manageWithdrawalLimit);
  app.use('/api/v1/admin/settings', manageAdminSettings);
};


