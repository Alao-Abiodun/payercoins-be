const catchAsync = require('../../utils/libs/catchAsync');
const AppError = require('../../utils/libs/appError');

const User = require('../../models/userModel');
const PaymentLink = require('../../models/paymentLinkModel');
const { successResMsg } = require('../../utils/libs/response');
const LiveBox = require('../../crypto-module')('live');
const SandBox = require('../../crypto-module')('sandbox');


exports.getUsersPaymentLinks = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const usersPaymentLinks = await PaymentLink.find().populate('user', '-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({updatedAt: -1})
      .exec();

  // get total documents in the collection 
  const count = await PaymentLink.countDocuments();

  if(!usersPaymentLinks) return successResMsg(res, 200, { message: "No Payment Link created so far"} )

  const dataInfo = {
    usersPaymentLinks,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };


  return successResMsg(res, 200, dataInfo)
})

exports.getUserPaymentLinks = catchAsync(async (req, res, next) => {

  const { page, limit} = req.query;
  const { id } = req.params;
  

  let userPaymentLinks = await PaymentLink.find({ user: id })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({updatedAt: -1})
    .exec();
  
    // get total documents in the collection 
  const count = await PaymentLink.countDocuments({ user: id });

  if(!userPaymentLinks) return successResMsg(res, 200, { message: "No Payment Link for this user"} )

  const dataInfo = {
    userPaymentLinks,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  }
  return successResMsg(res, 200, dataInfo)
})

exports.getUserPaymentLink = catchAsync(async (req, res, next) => {
  const { paymentLinkId } = req.params;

  let id = paymentLinkId;

  const paymentLink = await PaymentLink.findById(id).select('+isDisabled').populate('user', '-password')

  if (!paymentLink) {
    return next(new AppError('Payment Link not found!', 404));
  }

  if (paymentLink.environment === 'live'){
    const { details } = await LiveBox.getPaymentLink(paymentLink.paymentReference);

    const dataInfo = { paymentlink: paymentLink,  paymentPage: details };

    return successResMsg(res, 200, dataInfo)
  }

   const { details } = await SandBox.getPaymentPage(paymentLink.paymentReference);

  const dataInfo = { paymentlink: paymentLink,  paymentPage: details };
  return successResMsg(res, 200, dataInfo)
})


exports.disablePaymentLink = catchAsync(async (req, res, next) => {
  const { paymentLinkId } = req.params;

  let id = paymentLinkId;

  const paymentLink = await PaymentLink.findByIdAndUpdate(id, { isDisabled: true }, {
    new: true,
    runValidators: true,
  });

  if (!paymentLink) {
    return next(new AppError('Payment Link with ID not found', 404));
  }

  const dataInfo = { message: 'Payment Link disabled successfully', paymentlink: paymentLink };

  return successResMsg(res, 200, dataInfo)
})

exports.getPaymentLinkTransactions = catchAsync(async (req, res, next) => {
  const { paymentLinkId } = req.params;

  let id = paymentLinkId;

  const paymentLink = await PaymentLink.findById(id);
  

  if (!paymentLink) {
    return next(new AppError('Payment Link with ID not found', 404));
  }

  if (paymentLink.environment === 'live'){
    const { details } = await LiveBox.getPaymentPageTransactions(paymentLink.paymentReference);

    const dataInfo = { paymentlink: paymentLink,  paymentPage: details };

    return successResMsg(res, 200, dataInfo)
  }

  const { details } = await SandBox.getPaymentPageTransactions(paymentLink.paymentReference);

  const dataInfo = { paymentlink: paymentLink,  paymentPage: details };

  return successResMsg(res, 200, dataInfo)
});

