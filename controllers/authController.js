const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const UUID = require("uuid");
const catchAsync = require("../utils/libs/catchAsync");
const AppError = require("../utils/libs/appError");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Business = require("../models/businessModel");
const Settings = require("../models/settingsModel");
const sendEmail = require("../utils/libs/email");
const { successResMsg } = require("../utils/libs/response");
const { cloudinaryUploadMethod } = require("../utils/libs/cloudinaryUpload");
const {
  createDefaultWallets,
  getDefaultActiveWallets,
} = require("../utils/libs/cryptoModule");

const {
  signAccessToken,
  verifyAccessToken,
} = require("../utils/libs/jwt-helper");

const URL =
  process.env.NODE_ENV === "development"
    ? process.env.PAYERCOINS_FRONT_END_DEV_URL
    : process.env.PAYERCOINS_FRONT_END_LIVE_URL;

const createSendToken = (user, statusCode, res) => {
  const token = signAccessToken({
    id: user._id,
    email: user.email,
    isUserVerified: user.isUserVerified,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.PAYERCOINS_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  user.password = undefined;

  res.cookie("jwt", token, cookieOptions);

  const dataInfo = { token, user };
  return successResMsg(res, 200, dataInfo);
};

// Logout User
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  return successResMsg(res, 200, {});
};

// Login User
exports.login = catchAsync(async (req, res, next) => {
  let user;

  const { email, password } = req.body;
  // Check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // Check if the user exists and password correct
  user = await User.findOne({ email }).select("+password +isVerified +block");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.isVerified) {
    return next(new AppError("Please verify your email first!", 403));
  }

  if (user.block) {
    return next(new AppError("Your account is blocked", 403));
  }

  // If all true, send token to user
  createSendToken(user, 200, res);
});

exports.createUser = async (req, res, next) => {
  const session = await mongoose.startSession(); // Start Session
  session.startTransaction(); // start Transaction

  try {
    let userType = req.body.userType;

    if (!userType) {
      return next(new AppError("Please provide user type!", 400));
    }

    const userTypeArray = ["individual", "business"];
    if (!userTypeArray.includes(userType))
      return next(new AppError("userType is not supported"));

    if (userType === "individual") {
      const { firstName, lastName, email, country, phoneNumber, password } =
        req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phoneNumber ||
        !country ||
        !password
      ) {
        return next(
          new AppError(
            "Please provide first name, last name, email, country, phone number and password!",
            400
          )
        );
      }

      const user = await User.findOne({ email }).select("+password");

      if (user) {
        return next(new AppError("Email already exists!", 400));
      }

      const newUser = await User.create({
        uuid: UUID.v4(),
        firstName,
        lastName,
        email,
        country,
        phoneNumber,
        password,
        userType,
      });

      const defaultWallets = await getDefaultActiveWallets();

      await Settings.create({
        user: newUser._id,
        wallets: defaultWallets,
      });

      await createDefaultWallets(newUser.uuid);
    } else if (userType === "business") {
      const {
        firstName,
        lastName,
        email,
        country,
        phoneNumber,
        password,
        businessName,
        businessIndustry,
        businessEmail,
        businessRole,
        businessURL,
        description,
        businessAddress,
      } = req.body;

      // validate the req.body
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phoneNumber ||
        !country ||
        !password ||
        !businessName ||
        !businessIndustry ||
        !businessEmail ||
        !businessRole ||
        !businessURL ||
        !description ||
        !businessAddress
      ) {
        return next(
          new AppError(
            "Please provide first name, last name, email, phone number, country, password, business name, business industry, business email, business role, business url, description, business address!",
            400
          )
        );
      }

      const user = await User.findOne({ email }).select("+password");
      const phone = await User.findOne({ phoneNumber });

      if (user || phone) {
        return next(new AppError("Email or Phone Number already exist!", 400));
      }

      const business = await Business.findOne({ email });

      if (business) {
        return next(new AppError("Business Email already exists!", 400));
      }

      const { path } = req.file;

      const newPath = await cloudinaryUploadMethod(path);

      const uploadedFile = newPath.res;
      // console.log({uploadedFile});

      if (!uploadedFile) {
        return next(new AppError("upload file error", 400));
      }

      const newUser = await User.create({
        uuid: UUID.v4(),
        firstName,
        lastName,
        email,
        country,
        phoneNumber,
        password,
        userType,
        isBusiness: true,
      });

      // console.log('got here');

      const newBusiness = await Business.create({
        businessName,
        businessIndustry,
        businessEmail,
        businessRole,
        businessURL,
        description,
        businessAddress,
        businessDocument: uploadedFile,
        user: newUser,
      });

      const defaultWallets = await getDefaultActiveWallets();

      await Settings.create({
        user: newUser._id,
        wallets: defaultWallets,
      });

      await createDefaultWallets(newUser.uuid);
    }

    const data = {
      email: req.body.email,
    };

    const token = signAccessToken(data);
    const verificationUrl = `${URL}/auth/email/verify/?verification_token=${token}`;

    ejs.renderFile(
      path.join(__dirname, "../views/email-template.ejs"),
      {
        salutation: `Hi ${req.body.firstName}`,
        body: `Thank you for signing up on Payercoins<br><br>

            Kindly <a href="${verificationUrl}">click here</a> to verify your email.
            <br><br>
            Need help? ask at <a href="mailto:support@payercoins.com">support@payercoins.com</a>
            `,
      },
      async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: req.body.email,
          subject: "Verify Your Email",
          message: data,
        };
        await sendEmail(options);
      }
    );

    const dataInfo = {
      message:
        "Hello, your account has been successfully registered. To complete the verification process, please check your email to verify your account.!",
    };

    await session.commitTransaction(); // comit Transaction
    session.endSession(); // end the Session

    return successResMsg(res, 201, dataInfo);
  } catch (error) {
    await session.abortTransaction(); // abort transaction which is a rollback
    session.endSession(); // end the session
    return next(new AppError(error, error.status));
  }
};

// verify user email address after registration
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // attach descriptive the verification token to the query params
  const { verification_token } = req.query;

  if (!verification_token) {
    return next(new AppError("Please provide verification token!", 400));
  }

  const decoded = await verifyAccessToken(verification_token);

  if (
    decoded &&
    decoded.name !== "JsonWebTokenError" &&
    decoded.name !== "TokenExpiredError"
  ) {
    const user = await User.findOne({ email: decoded.email }).select(
      "+isVerified"
    );
    if (!user) return next(new AppError("Email has not been registered", 400));

    if (user.isVerified) {
      return next(new AppError("Email has already been verified!", 400));
    }

    user.isVerified = true;
    await user.save();

    const walkthroughVideoUrl =
      "https://youtube.com/channel/UCsRIQuuCcvjWoyCHhNoBRVA";
    const telegramGroupUrl = "https://t.me/+9fDGmfvUf1tjMmRk";

    ejs.renderFile(
      path.join(__dirname, "../views/email-template.ejs"),
      {
        salutation: `Hi ${user.firstName},`,
        body: ` I'm glad you signed up with Payercoins to accept crypto payment, we have built 
                Payercoins to help startups and creators accept stablecoins for online payment.<br><br>
  
                Over $140 billion of stable coins are in circulation and we have carefully studied how
                businesses can tap into this market and this is what led to building Payercoins.<br><br>
    
                Stablecoins are digital currencies that are pegged to a “stable” reserve asset like 
                the U.S. dollar, Euro or Gold. We currently support 3 stable coins which are 
                enabled by default when you create your account , USDT (TRC20 and BEP20),
                BUSD (BEP20) and USDC (BEP20). You can enable Bitcoin and Ethereum in your 
                settings if you understand the risk involved.<br><br>
    
                Whatever coin you accept, we do settlement to your country's local bank account or preferred
                crypto wallet.<br><br>
                
                Since this is your first time here, I will recommend you <a href="${telegramGroupUrl}">join our telegram group</a> to 
                meet other startups and creators accepting crypto payment with Payercoins. We 
                have also prepared a <a href="${walkthroughVideoUrl}">walkthrough video</a>
                to guide you through the process of using Payercoins.<br><br>

                <strong>With love from</strong><br>
                <strong>Victor Adeleye</strong><br>
                <strong>Co-founder, Payercoins.</strong><br><br>
    
                Need help? ask at <a href="mailto:support@payercoins.com">support@payercoins.com</a>
            `,
      },
      async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: user.email,
          subject: "Welcome to Payercoins",
          message: data,
        };
        await sendEmail(options);
      }
    );

    const dataInfo = { message: "Email verification successful" };
    return successResMsg(res, 200, dataInfo);
  } else if (decoded.name === "TokenExpiredError")
    return next(new AppError("Verification email link has expired!", 400));
  else if (decoded.name === "JsonWebTokenError")
    return next(new AppError(decoded.message, 400));
  else return next(new AppError("Something went wrong", 400));
});

exports.resendEmailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide email!", 400));
  }

  const user = await User.findOne({ email }).select("+isVerified");

  if (!user) {
    return next(new AppError("Email has not been registered", 400));
  }

  if (user.isVerified) {
    return next(new AppError("Email has already been verified!", 400));
  }

  const data = {
    email,
  };

  const token = signAccessToken(data);
  const verificationUrl = `${URL}/auth/email/verify/?verification_token=${token}`;
  const walkthroughVideoUrl =
    "https://youtube.com/channel/UCsRIQuuCcvjWoyCHhNoBRVA";

  ejs.renderFile(
    path.join(__dirname, "../views/email-template.ejs"),
    {
      salutation: `Hi ${req.body.firstName}`,
      body: `Thank you for signing up on Payercoins<br><br>

            Kindly <a href="${verificationUrl}">click here</a> to verify your email.
            <br><br>
            Need help? ask at <a href="mailto:support@payercoins.com">support@payercoins.com</a> or 
            check check out our <a href="${walkthroughVideoUrl}">walkthrough video</a>.<br><br>
            `,
    },
    async (err, data) => {
      //use the data here as the mail body
      const options = {
        email: req.body.email,
        subject: "Verify Your Email",
        message: data,
      };
      await sendEmail(options);
    }
  );

  const dataInfo = { message: "Verification email re-sent" };
  return successResMsg(res, 200, dataInfo);
});

// Protects Routes
exports.protect = catchAsync(async (req, res, next) => {
  let token, currentUser;
  // Get token and check if it exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1].toString();
  } else if (req.cookies) {
    token = req.cookies.jwt;
  } else {
    console.log('INVALID TOKEN');
    // No token found
    return next(new AppError("Invalid authentication token", 401));
  }
  if (!token) {
    console.log('NOT LOGGED IN');
    return next(
      new AppError("You are not logged in!. Please login to gain access", 401)
    ); // 401 - Unauthorized
  }
  if (token.startsWith("PYC")) {
    //    console.log(token);
    // Token verification
    let user_settings;
    // fetch node env to verify user keys
    let env = process.env.NODE_ENV === "production" ? "live" : "sandbox";
    if (env === "live") {
      console.log('GET USER SETTINGS LIVE')
      user_settings = await Settings.findOne({
        "api_keys.live_keys.secret_key": token,
      });
    } else {
      console.log('GET USER SETTINGS TEST')
      user_settings = await Settings.findOne({
        "api_keys.test_keys.secret_key": token,
      });
    }
    if (!user_settings) {
      console.log('NO USER SETTINGS');
      return next(new AppError("Invalid authentication token", 401));
    }
    // confirm if user settings is in test
    if (env !== user_settings.environment) {
      console.log('ENVIRONMENT MISMATCH', env, user_settings.environment);
      return next(
        new AppError("Your environment does not match your keys", 401)
      );
    }
    currentUser = await User.findById(user_settings.user);
  } else {
    // Token verification
    const decoded = verifyAccessToken(token.toString());

    console.log(decoded, 'DECODED TOKEN')

    // Check if user still exists
    currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      console.log('USER NO LONGER EXIST');
      return next(new AppError("This user no longer exist", 401));
    }
    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      console.log('CHANGED PASSWORD');
      return next(
        new AppError("User recently changed password! Please login again.", 401)
      );
    }
  }

  const { environment, wallets, settlements, api_keys, callback_url } =
    await Settings.findOne({ user: currentUser._id });

    console.log('AFTER GETTING USER SETTINGS RECORD')

  // Grant user access to route
  req.user = currentUser;

  //attach crypto box to a global variable
  req.cryptoBox = require("../crypto-module")(environment);
  req.wallets = wallets;
  req.environment = environment;
  req.settlements = settlements;
  req.api_keys = api_keys;
  req.callback_url = callback_url;

  res.locals.user = currentUser;

  next();
});

exports.validatePubKey = catchAsync(async (req, res, next) => {
  try {
    let token = req.headers["x-access-token"];
    if (!token) {
      return next(new AppError("Kindly provide an authentication token", 401)); // 401 - Unauthorized
    }
    if (!token || !token.startsWith("PYC")) {
      return next(new AppError("Invalid public key", 400));
    }
    let env = process.env.NODE_ENV === "production" ? "live" : "sandbox";
    let user_settings, user;
    if (env === "live") {
      user_settings = await Settings.findOne({
        "api_keys.live_keys.public_key": token,
      });
    } else {
      user_settings = await Settings.findOne({
        "api_keys.test_keys.public_key": token,
      });
    }
    if (!user_settings) {
      return next(new AppError("Invalid authentication token", 401));
    }

    user = await User.findById(user_settings.user);
    if (!user) {
      return next(new AppError("This user account no longer exist", 401));
    }

    // Grant user access to route
    req.user = user;

    //attach crypto box to a global variable
    req.cryptoBox = require("../crypto-module")(env);
    req.environment = env;
    req.wallets = user_settings.wallets;
    req.callback_url = user_settings.callback_url;

    next();
  } catch (error) {
    console.log(error);
  }
});

// Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  // Get token and check if it exists
  if (req.cookies.jwt) {
    try {
      // Token verification
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.PAYERCOINS_ACCESS_TOKEN_SECRET
      );

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next;
    }
  }
  next();
};

// Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get User based on password provided
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError("There is no user with the provided email address", 404)
    );
  }
  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send token via user's email
    const resetURL = `${URL}/auth/reset/resetPassword/?confirmationToken=${resetToken}`;

    ejs.renderFile(
      path.join(__dirname, "../views/email-template.ejs"),
      {
        salutation: `Hello ${user.firstName}`,
        body: `<p>We received a request to reset your password for your account. We're here to help! \n </p>
        <p>Simply click on the link below to set a new password: \n <p> 
        <strong><a href=${resetURL}>Change my password</a></strong> \n
        <p>If you didn't ask to change your password, don't worry! Your password is still safe and you can delete this email.\n <p> 
        <p>If you don’t use this link within 1 hour, it will expire. \n <p>`,
      },
      async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: req.body.email,
          subject: "Password Reset!",
          message: data,
        };
        await sendEmail(options);
      }
    );

    const dataInfo = { message: "Password reset token sent!" };
    return successResMsg(res, 200, dataInfo);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email", 500));
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resettoken: confirmationToken } = req.params;
  // Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(confirmationToken, "utf8")
    .digest("hex");

  console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // Check if token is still valid / not expired -- set new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // No need to turn off validator as it's required

  // Update passwordChangedAt property in userModel

  const loginUrl = `${URL}/login`;

  // send a mail
  ejs.renderFile(
    path.join(__dirname, "../views/email-template.ejs"),
    {
      salutation: `Hello ${user.firstName}`,
      body: `<p> PASSWORD CHANGE NOTIFICATION \n </p>
      <p>We are pleased to inform you that based on your recent request, your password has been changed successfully. \n <p> 
      <p>Click the link below to log in with your new password:\n <p> 
      <strong><a href=${loginUrl}>Login to your account</a></strong> \n`,
    },
    async (err, data) => {
      //use the data here as the mail body
      const options = {
        email: user.email,
        subject: "Password Reset Successfull!",
        message: data,
      };
      await sendEmail(options);
    }
  );

  // Log in user -- send JWT
  createSendToken(user, 200, res);
});

// Updating password of a logged in user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Password Incorrect. Try again!!", 401));
  }

  // Update Password
  user.password = req.body.newPassword;
  await user.save();

  // send a mail
  ejs.renderFile(
    path.join(__dirname, "../views/email-template.ejs"),
    {
      salutation: `Hello ${user.firstName}`,
      body: `<p> You've successfully changed your password \n </p>
      <p>If you didnt perfom this action, contact support immediately  \n <p> `,
    },
    async (err, data) => {
      //use the data here as the mail body
      const options = {
        email: user.email,
        subject: "Password Changed!",
        message: data,
      };
      await sendEmail(options);
    }
  );

  // Log user in -- send JWT
  createSendToken(user, 200, res);
});
