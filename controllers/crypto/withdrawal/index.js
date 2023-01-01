const ejs = require('ejs'),
    mongoose = require('mongoose'),
    path = require('path'),
    moment = require('moment'),
    catchAsync = require('../../../utils/libs/catchAsync'),
    AppError = require('../../../utils/libs/appError'),
    Otp = require('../../../models/otpModel'),
    WithdrawalWallets = require('../../../models/withdrawalWalletsModel'),
    WithdrawalRequest = require('../../../models/withdrawalRequestModel'),
    WithdrawalLimits = require('../../../models/withdrawalLimitModel'),
    Business = require('../../../models/businessModel'),
    Rates = require('../../../models/rateModel'),
    sendEmail = require('../../../utils/libs/email'),
    { successResMsg } = require('../../../utils/libs/response'),
    { generateToken } = require('../../../utils/libs/gen-otp');

//send otp to user email to initiate a withdrawal request
exports.initiate = catchAsync(async (req, res, next) => {
    try {
        const { _id, email, firstName } = req.user;

        const { type } = req.body;
        if(!type) {
          return next(new AppError('Withdrawal type must be specified', 401));
        }

        //generate 6 digits token to be sent to the email.
        const generatedToken = generateToken();

        // check if the user has already initiated a withdrawal request
        const checkOtp = await Otp.findOne({'email': email});
        if(checkOtp) {
          return next(new AppError('You cannot make withdrawal request more than once within 5 minutes', 401));
        }

        if(type === 'crypto') {
            const {
                amount,
                address,
                walletName,
                wallet,
                walletSymbol
            } = req.body;

            let verifyAddress = await req.cryptoBox.verifyCryptoAddress(address, walletSymbol);
            if(!verifyAddress) {
              return next(new AppError('Invalid wallet address', 401));
            }

            // create the otp document
            await Otp.create({
                user: _id,
                email: email,
                code: generatedToken,
                data: {
                    type: type,
                    amount: amount,
                    wallet: wallet,
                    fiat_amount: '',
                    walletName: walletName,
                    address: address
                }
            })

            ejs.renderFile(
                path.join(__dirname, '../../../views/email-template.ejs'), {
                    salutation: `Hello ${firstName},`,
                    body: `
                    Please use the OTP code below to confirm withdrawal from your wallet.<br>
                    <h2>${generatedToken}</h2> 
                    <br>
                    This code expires in 5 minutes.
                    <br><br>
                    Ignore this mail, if you didn't request a withdrawal.
                    `
                }, async (err, data) => {
                    //use the data here as the mail body
                    const options = {
                        email: email,
                        subject: 'Withdrawal Confirmation',
                        message: data,
                    };
                    /*
                    body: `You requested to make a withdrawal of <strong>${amount} ${walletName}</strong> 
                    to this address: ${address} <br /> 
                    Before going further with the withdrawal, please check carefully the target address 
                    Be aware if you confirm an inccocent address or account, we won't 
                    be able to assist you to recover your asset.<br />
                    <h1><small>Verification Code: </small> <strong>${generatedToken} </strong></h1> 
                    The verification code will be valid for 5 minutess, Please do not share this code 
                    with anyone.<br />
                    If you did not initiate this operation, contact support immediately.`
                    */
                    await sendEmail(options);
                }
            );
        } else if(type === 'fiat') {

          if(req.environment === 'sandbox') {
             return next(new AppError('Withdrawal to fiat is not allowed in sandbox environment', 401));
          }

          let verificationStatusLimit;
          let amountRemaining;
          let userVerificationStatus;
            const {
                amount,
                walletName,
                wallet,
                fiat_amount,
                amount_in_usd
            } = req.body;

            // Get User Verification Status && user type
            userVerificationStatus = req.user.isUserVerified;
            const userType = req.user.userType;

            if (userType === 'business') {
              const businessObject = await Business.findOne({ user: req.user._id});
              console.log(businessObject);
              const businessVerificationStatus = businessObject.isBusinessVerified;
              if (businessVerificationStatus && userVerificationStatus) {
                userVerificationStatus = true;
              } else {
                userVerificationStatus = false;
              }
            }
            
            // Get amount to be withdrawn in naira
            const amountTobeWithdrawnInNaira = fiat_amount;

           // If user is not verified
            if (!userVerificationStatus ) {
              // console.log('User is not verified');
              // console.log({userVerificationStatus});
               // get verification status limit for the usertype 
              verificationStatusLimit = await WithdrawalLimits.findOne({ userType: userType, accountType: 'unverified' });

                const totalWithdrawn = await WithdrawalRequest.aggregate([
                  { $match: { "user": mongoose.Types.ObjectId(req.user._id), "status": "completed" } },
                    {
                      $group: {
                        _id: '$user',
                        "count": {
                          "$sum": 1
                        },                           
                        fiat_amount: { $sum: { "$toDouble": "$fiat_amount" } },
                      }
                    }
                ]);

                if (totalWithdrawn.length === 0) {
                  totalWithdrawn.push({
                    fiat_amount: 0
                  });
                }

                const totalToBeWithdrawnInNaira = parseInt(totalWithdrawn[0].fiat_amount) + parseInt(amountTobeWithdrawnInNaira);
                // console.log('=====totalToBeWithdrawnInNaira');
                // console.log(totalToBeWithdrawnInNaira);
                // console.log('=====totalToBeWithdrawnInNaira');

              // get the total amount withdrawn in naira then check if the person can withdraw more
              if (verificationStatusLimit.amount < totalToBeWithdrawnInNaira) {
                amountRemaining = parseInt(verificationStatusLimit.amount) - parseInt(totalWithdrawn[0].fiat_amount);
                // console.log('=====amountRemaining');
                // console.log(amountRemaining);
                // console.log('=====amountRemaining');
                return next(new AppError(`You have reached the limit for unverified account withdrawals, you have N${amountRemaining} remaining`, 403));
              }
                
            } 

            // If user is verified
            if (userVerificationStatus) {
              // console.log('User is verified');
              // console.log({userVerificationStatus});
                const today = moment().startOf('day');
                // get verification status limit for the usertype 
                verificationStatusLimit = await WithdrawalLimits.findOne({ userType: userType, accountType: 'verified' });

                const dailyAmountWithdrawn = await WithdrawalRequest.aggregate([
                  { $match: { 
                    "user": mongoose.Types.ObjectId(req.user._id), 
                    "status": "completed",
                    "createdAt": {
                      $gte: today.toDate(),
                      $lte: moment(today).endOf('day').toDate()
                    }

                  }},
                    {
                      $group: {
                        _id: '$user',
                        "count": {
                          "$sum": 1
                        },
                        fiat_amount: { $sum:   { "$toDouble": "$fiat_amount" } },
                      }
                    }
                ])

                if (dailyAmountWithdrawn.length === 0) {
                  dailyAmountWithdrawn.push({
                    fiat_amount: 0
                  });
                }

                // console.log('=====dailyAmountWithdrawn');
                // console.log(dailyAmountWithdrawn);
                // console.log('=====dailyAmountWithdrawn');

                const dailyToBeWithdrawnInNaira = parseInt(dailyAmountWithdrawn[0].fiat_amount) + parseInt(amountTobeWithdrawnInNaira);
                // console.log('=====dailyToBeWithdrawnInNaira');
                // console.log(dailyToBeWithdrawnInNaira);
                // console.log('=====dailyToBeWithdrawnInNaira');

              // get the total amount withdrawn in naira then check if the person can withdraw more
              if (verificationStatusLimit.amount < dailyToBeWithdrawnInNaira) {
                amountRemaining = parseInt(verificationStatusLimit.amount) - parseInt(dailyAmountWithdrawn[0].fiat_amount);
                return next(new AppError(`You have reached the limit for verified account withdrawals, you have N${amountRemaining} remaining`, 400));
              }
            }



   
            // create the otp document
            await Otp.create({
                user: _id,
                email: email,
                code: generatedToken,
                data: {
                    type: type,
                    amount: amount,
                    wallet: wallet,
                    fiat_amount: fiat_amount,
                    amount_in_usd: amount_in_usd,
                    walletName: walletName,
                    address: ''
                }
            })

            ejs.renderFile(
                path.join(__dirname, '../../../views/email-template.ejs'), {
                    salutation: `Hello ${firstName},`,
                    body: `
                    Please use the OTP code below to confirm withdrawal from your wallet.<br>
                    <h2>${generatedToken}</h2> 
                    <br>
                    This code expires in 5 minutes.
                    <br><br>
                    Ignore this mail, if you didn't request a withdrawal.
                    `
                }, async (err, data) => {
                    //use the data here as the mail body
                    const options = {
                        email: email,
                        subject: 'Withdrawal Confirmation',
                        message: data,
                    };
                    await sendEmail(options);
                }
            );
        }
        return successResMsg(res, 201, { message: 'A one-time password has been sent to your registered email address.'});
    } catch(err) {
        return next(new AppError(`We are unable to initiate your withdrawal request: ${err}`, 401));
    }
});

exports.process = catchAsync( async (req, res, next) => {
    console.log('START WITHDRAWAL PROCESSING.')
    try {
        const { otp }  = req.body;
        const user_id = req.user._id;
        const otp_data = await Otp.findOne({code: otp, user: user_id});
        if (!otp_data) {
            return next(new AppError('Your verification code is invalid', 401));
        }
        await Otp.deleteOne({code: otp, user: user_id});

        const { data: { type, amount, address, wallet, fiat_amount, amount_in_usd, walletName } } = otp_data;
        if(type === 'crypto') {
            if(wallet && amount && address) {
                let fee = 0.0;
                const transaction = await req.cryptoBox.sendCryptoToAddress(req.user.uuid, wallet, amount, fee, address, walletName);
                return successResMsg(res, 200, { 
                    message: 'Your withdrawal request is being processed.',
                    transaction: transaction.transaction
                });
            } else {
                return next(new AppError('Invalid parameter', 401));
            }
        } else if(type === 'fiat') {
            const { wallets } = await WithdrawalWallets.findOne({owner: req.environment});
            console.log(wallets);
            console.log(wallets[walletName].wallet_address);
            if(wallet && amount) {
                let fee = 0.0;
                const { transaction } = await req.cryptoBox.sendCryptoToAddress(req.user.uuid, wallet, amount, fee, wallets[walletName].wallet_address, walletName);
                await WithdrawalRequest.create({
                    user: user_id,
                    amount: amount,
                    walletSlug: wallet,
                    amount_usd: amount_in_usd,
                    fiat_amount: fiat_amount,
                    walletName: walletName,
                    transaction: transaction,
                    status: 'pending'
                });
                return successResMsg(res, 200, { 
                    message: 'Your withdrawal request is being processed.',
                    transaction
                });
            } else {
                return next(new AppError('Invalid parameter', 401));
            }
        }
    } catch(err) {
        console.log(err, 'ERROR IN PROCESSING WITHDRAWAL')
        return next(new AppError(err, 401));
    }
})

exports.getFiatTransactions = catchAsync(async (req, res, next) => {
  try {

      const { page, limit, crypto } = req.query;
      let transactions, count;

      if(crypto) {
        transactions = await WithdrawalRequest.find({user: req.user._id, walletSlug: crypto})
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({updatedAt: -1})
          .exec();
          // get total documents in the collection 
        count = await WithdrawalRequest.find({user: req.user._id, walletSlug: crypto});
      } else {
        transactions = await WithdrawalRequest.find({user: req.user._id})
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({updatedAt: -1})
          .exec();
        // get total documents in the collection 
        count = await WithdrawalRequest.find({user: req.user._id});
      }

      if(!transactions) return successResMsg(res, 200, { message: "No transaction"});

      const dataInfo = {
        transactions,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      };


      return successResMsg(res, 200, dataInfo)
    } catch (err) {
      return next(new AppError(err, 400));
    }
});