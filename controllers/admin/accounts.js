const catchAsync = require('../../utils/libs/catchAsync');
const ejs = require('ejs');
const path = require('path');
const AppError = require('../../utils/libs/appError');
const User = require('../../models/userModel');
const Business = require('../../models/businessModel');
const sendEmail = require('../../utils/libs/email');
const { successResMsg } = require('../../utils/libs/response');
const { log } = require('console');

const LiveBox = require('../../crypto-module')('live');
const SandBox = require('../../crypto-module')('sandbox');

exports.getIndividualAccounts = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const individualAccounts = await User.find({ userType: 'individual' })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({updatedAt: -1})
      .exec();

  // get total documents in the collection 
  const count = await User.countDocuments({ userType: 'individual' });

  if(!individualAccounts) return successResMsg(res, 200, { message: "No Individual account on the platform sofar"} )

  const dataInfo = {
    individualAccounts,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };


  return successResMsg(res, 200, dataInfo)
})

exports.getApprovedBusinesses = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const approvedBusinesses = await Business.find({ isBusinessVerified: true})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({updatedAt: -1})
      .exec();

  // get total documents in the collection 
  const count = await Business.countDocuments({ isBusinessVerified: true});

  if(!approvedBusinesses) return successResMsg(res, 200, { message: "No Approved Business on the platform sofar"} )

  const dataInfo = {
    approvedBusinesses,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };


  return successResMsg(res, 200, dataInfo)
})

exports.getPendingBusinesses = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const pendingBusinesses = await Business.find({ isBusinessVerified: false })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({updatedAt: -1})
      .exec();

  // get total documents in the collection 
  const count = await Business.countDocuments({ isBusinessVerified: false});

  if(!pendingBusinesses) return successResMsg(res, 200, { message: "No Approved Business on the platform sofar"} )

  const dataInfo = {
    pendingBusinesses,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };


  return successResMsg(res, 200, dataInfo)
})

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (user.userType === 'business') {
    const business = await Business.findOne({user: id});
    if (!business) return next(new AppError('business not found', 404));
    const data = { business };
    return successResMsg(res, 200, data )
  }

  if(!user) {
    return next(new AppError('User not found', 404)
    )
    next();
  };

  const data = { user }
  return successResMsg(res, 200, data )
})

exports.UpdateUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExists = await User.findById(id);

  if (!userExists)
    return next(new AppError('User does not exist, do check the user id correctly', 404));


  const { email, firstName, lastName } = req.body;

  const reqBody = {
    firstName,
    lastName,
    email
  }

  const updatedUser = await User.findByIdAndUpdate(id, reqBody, { 
    new: true,
    runValidators: true,
  });


  if (!updatedUser) {
    return next(new AppError('Update User failed', 404));
  }
  const data = { user: updatedUser, message: 'User updated successfully' };

  ejs.renderFile(
    path.join(__dirname, '../../views/email-template.ejs'), {
      salutation: `Hello ${updatedUser.email}`,
      body: `<p>Your Acount has been updated  \n </p>
      <p>Here is your new details: \n <p>
      <p>Email: ${updatedUser.email}  \n </p>
      <p>First Name: ${updatedUser.firstName} \n </p>
      <p>Last Name: ${updatedUser.lastName} \n </p>
      `,
    },
    async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: updatedUser.email,
          subject: 'Account Data Updated!',
          message: data,
        };
        await sendEmail(options);
    }
  );

  return successResMsg(res, 200, data);
})

exports.verifyBusiness = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExists = await User.findById(id);

  if (!userExists)
    return next(new AppError('User does not exist, do check the user id correctly', 404));

    const business = await Business.findOne({user: id});
    const reqBody = {
      isBusinessVerified: true
    }

  const updatedBusiness = await Business.findByIdAndUpdate(business._id, reqBody, { 
    new: true,
    runValidators: true,
  });

  if (!updatedBusiness) {
    return next(new AppError('Business Verification failed', 404));
  }
      const data = { 
        message: "Business Verified",
        user: updatedBusiness 
      };

  ejs.renderFile(
    path.join(__dirname, '../../views/email-template.ejs'), {
      salutation: `Hello ${business.businessName}`,
      body: `<p>Your Business Acount has been Verified successfully  \n </p>
      <p>Enjoy our Platform \n <p>`,
    },
    async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: business.businessEmail,
          subject: 'Business Verification Success!',
          message: data,
        };
        await sendEmail(options);
    }
  );

  return successResMsg(res, 200, data);
})

exports.rejectBusiness = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExists = await User.findById(id);

  if (!userExists)
    return next(new AppError('User does not exist, do check the user id correctly', 404));

    const business = await Business.findOne({user: userExists._id});

  if (!business) {
    return next(new AppError('Business Does not exist', 404));
  }
  const data = { message: "Business Veriification Declined" };

  ejs.renderFile(
    path.join(__dirname, '../../views/email-template.ejs'), {
      salutation: `Hello ${business.businessName}`,
      body: `<p>Your Business Acount verification failed  \n </p>
      <p>Do upload another business document again\n <p>`,
    },
    async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: business.businessEmail,
          subject: 'Business Verification Failed!',
          message: data,
        };
        await sendEmail(options);
    }
  );

  return successResMsg(res, 200, data);
})

exports.blockUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExists = await User.findById(id).select('+block');

  if (!userExists)
    return next(new AppError('User does not exist, do check the user id correctly', 404));

  userExists.block = true;
  
  await userExists.save();

  const data = { message: "User Blocked", user: userExists };

  ejs.renderFile(
    path.join(__dirname, '../../views/email-template.ejs'), {
      salutation: `Hello ${userExists.firstName}`,
      body: `<p>Your Payercoins Acount has been Blocked \n </p>
      <p>Do contanct the the admin to clear all issues \n <p>`,
    },
    async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: userExists.email,
          subject: 'Payercoins Acount Blocked!',
          message: data,
        };
        await sendEmail(options);
    }
  );

  return successResMsg(res, 200, data);
})

exports.unBlockUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExists = await User.findById(id).select('+block');

  if (!userExists)
    return next(new AppError('User does not exist, do check the user id correctly', 404));

    userExists.block = false;
  
    await userExists.save();
  
    const data = { message: "User UnBlocked", user: userExists };
  
    ejs.renderFile(
      path.join(__dirname, '../../views/email-template.ejs'), {
        salutation: `Hello ${userExists.firstName}`,
        body: `<p>Your Payercoins Acount has been unBlocked \n </p>
        <p>Thank you \n <p>`,
      },
      async (err, data) => {
          //use the data here as the mail body
          const options = {
            email: userExists.email,
            subject: 'Payercoins Acount UnBlocked!',
            message: data,
          };
          await sendEmail(options);
      }
    );
  
    return successResMsg(res, 200, data);
})

exports.getDashboardData = catchAsync(async (req, res, next) => {
  try {

      // get total number of users
      const totalIndividualUsers = await User.find().countDocuments({ userType: 'individual' });
      const totalBusinessUsers = await User.find().countDocuments({ userType: 'business' });
      const sandbox_transaction_summary = await SandBox.getTransactionSummary();
      const live_transaction_summary = await LiveBox.getTransactionSummary();

      const dataInfo = {
        totalIndividualUsers,
        totalBusinessUsers,
        sandbox_transaction_summary,
        live_transaction_summary
      }

      return successResMsg(res, 200, dataInfo);
  } catch (error) {
    console.log(error);
    return next(new AppError(error, 500));
  }
})