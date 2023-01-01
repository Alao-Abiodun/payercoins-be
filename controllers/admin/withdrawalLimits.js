const WithdrawalLimits = require('../../models/withdrawalLimitModel'),
{ successResMsg } = require('../../utils/libs/response');

exports.getWithdrawalLimits = async (req, res, next) => {
  try {
    const withdrawalLimits = await WithdrawalLimits.find({});
    return successResMsg(res, '200', {
      message: 'Withdrawal limits fetched successfully',
      withdrawalLimits
    });
  } catch (error) {
    return next(new AppError(error, 500));
  }
}

exports.getWithdrawalLimitById = async (req, res, next) => {
  try {
    const withdrawalLimit = await WithdrawalLimits.findById(req.params.id);
    return successResMsg(res, '200', {
      message: 'Withdrawal limit fetched successfully',
      withdrawalLimit
    });
  } catch (error) {
    return next(new AppError(error, 500));
  }
}

exports.createWithdrawalLimit = async (req, res, next) => {
  try {
    const withdrawalLimit = await WithdrawalLimits.create(req.body);
    return successResMsg(res, '200', {
      message: 'Withdrawal limit created successfully',
      withdrawalLimit
    });
  } catch (error) {
    return next(new AppError(error, 500));
  }
}

exports.updateWithdrawalLimit = async (req, res, next) => {
  try {
    const withdrawalLimit = await WithdrawalLimits.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return successResMsg(res, '200', {
      message: 'Withdrawal limit updated successfully',
      withdrawalLimit
    });
  } catch (error) {
    return next(new AppError(error, 500));
  }
}
