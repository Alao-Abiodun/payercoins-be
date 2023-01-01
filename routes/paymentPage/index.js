const express = require("express");
const router = express.Router();

const authController = require("../../controllers/authController");
const paymentPageController = require("../../controllers/paymentPage");

const {validateSchema} = require("../../utils/validations");

const { createLink } = require("../../utils/validations/paymentLink");

const getId = (req, res, next) => {
  const { id } = req.user;
  //console.log(id);
  req.params.id = id;
  next();
};

//FREE ROUTES
router.get("/convert-to-image", paymentPageController.convertToImage);
router.get("/:paymentlink", paymentPageController.getPaymentLinkWithSlug);
router.post("/mail-payment-details", paymentPageController.mailPaymentDetails);
router.post(
  "/click-here-to-monitor-status/:id",
  paymentPageController.clickHereToMonitorStatus
);

// PROCTECTED ROUTES
router.post(
  "/create",
  validateSchema(createLink),
  authController.protect,
  paymentPageController.createPaymentLink
);
router.get(
  "/",
  authController.protect,
  getId,
  paymentPageController.getUserPaymentLinks
);
router.get(
  "/single/:id",
  authController.protect,
  paymentPageController.getPaymentLinkWithId
);
router.get(
  "/transactions/:id",
  authController.protect,
  paymentPageController.getPaymentLinkTransactions
);
//router.patch('/update/:id', authController.protect, paymentPageController.updatePaymentLink);
router.put(
  "/disable/:id",
  authController.protect,
  paymentPageController.disablePaymentLink
);
router.put(
  "/enable/:id",
  authController.protect,
  paymentPageController.enablePaymentLink
);
router.delete(
  "/delete/:id",
  authController.protect,
  paymentPageController.deletePaymentLink
);

module.exports = router;
