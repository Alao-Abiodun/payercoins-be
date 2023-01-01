const ejs = require('ejs');
const path = require('path');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const sendEmail = require('../utils/libs/email');
const { successResMsg } = require('../utils/libs/response');
const { generateToken } = require('../utils/libs/gen-otp');

//send otp to user email
exports.sendOtp = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    const {
        amount,
        WalletAddress,
        accountNumber,
        action,
        currency
    } = req.body;

    const addressAccount = WalletAddress || accountNumber;

    // check if user exist
    const user = await User.findById(id)

    if (!user ) {
        return next(new AppError('User does not exist!', 400))
    }

    // if there is user, generate 6 digits token to be sent to the email.
    const generatedToken = await generateToken();

    // create the otp document

    const newOtp = await Otp.create({
        user: req.user._id,
        email: user.email,
        code: generatedToken
    })

    ejs.renderFile(
        path.join(__dirname, '../views/email-template.ejs'), {
            salutation: `Hello ${user.firstName}`,
            body: `<p>You requested to ${action} ${amount} ${currency} \n </p>
      <p>to this address ${addressAccount} \n <p> 
      <p>Before going further with the withdrawal, please check carefully the target address \n <p> 
      <p>Be aware if you confirm an inccocent address or account, we won't \n <p> 
      <p>be able to assist you to recover your asset. \n <p>
      <h4>Verification Code </h4> 
      <p>${generatedToken} \n <p> 
      <p>The Verification code will be valid for 5 minutess, Please do not share this code \n <p> 
      <p>with anyone \n <p> 
      <p>If you did not initiate this operationm contact support immediately \n <p> 
      <p>with anyone \n <p>`
        },

        async (err, data) => {
            //use the data here as the mail body
            const options = {
                email: user.email,
                subject: 'Email Verification',
                message: data,
            };
            await sendEmail(options);
        }
    );

    const dataInfo = { message: 'OTP sent, check your email'};
    return successResMsg(res, 201, dataInfo);

})

exports.verifyOtp = catchAsync( async (req, res, next) => {
    const { otp }  = req.body;

    const getOtp = await  Otp.findOne({code: otp, user: req.user._id});

    if (!getOtp) {
        return next(
            new  AppError('Invalid OTP', 401)
        );
    }

    await Otp.deleteOne({code: otp, user: req.user._id});

    return successResMsg(res, 200 , {message: 'OTP Verified successfully!'})
})