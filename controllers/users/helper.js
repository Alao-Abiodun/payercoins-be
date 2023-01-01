require("dotenv").config();
const mongoose = require("mongoose"),
  Settings = require("../../models/settingsModel"),
  User = require("../../models/userModel");

exports.getUserDetailsByUuid = async (uuid) => {
  const DB = process.env.PAYERCOINS_DB.replace(
    "<password>",
    process.env.PAYERCOINS_PASSWORD
  );
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  }
  if (!uuid) {
    throw Error("Please provide a valid uuid");
  }

  const user = await User.findOne({ uuid });

  if (!user) throw Error("User does not exist");

  return user.email;
};

exports.getUserTransactionFeePrefereenceByUuid = async (uuid) => {
  const DB = process.env.PAYERCOINS_DB.replace(
    "<password>",
    process.env.PAYERCOINS_PASSWORD
  );
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  }
  if (!uuid) {
    throw Error("Please provide a valid uuid");
  }

  const user = await User.findOne({ uuid: uuid });

  if (!user) throw Error("User does not exist");

  const settings = await Settings.findOne({ user: user._id });

  return {
    preference: settings.transaction_fees_preference,
    fee: 0.8,
  };
};

exports.getUserSecretKey = async (uuid, env) => {
  const DB = process.env.PAYERCOINS_DB.replace(
    "<password>",
    process.env.PAYERCOINS_PASSWORD
  );
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  }
  if (!uuid) {
    throw Error("Please provide a valid uuid");
  }

  const user = await User.findOne({ uuid: uuid });

  if (!user) throw Error("User does not exist");

  const settings = await Settings.findOne({ user: user._id });

  if (env === "live") {
    return settings.api_keys.live_keys.secret_key;
  }
  return settings.api_keys.test_keys.secret_key;
};

exports.getUserDetailsByUserId = async (userId) => {
  const DB = process.env.PAYERCOINS_DB.replace(
    "<password>",
    process.env.PAYERCOINS_PASSWORD
  );
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  }
  if (!userId) {
    throw Error("Please provide a valid uuid");
  }

  const user = await User.findById(userId);

  if (!user) throw Error("User does not exist");

  return user;
};

exports.getUserAPIKeysByUserId = async (userId) => {
  const DB = process.env.PAYERCOINS_DB.replace(
    "<password>",
    process.env.PAYERCOINS_PASSWORD
  );
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  }
  if (!userId) {
    throw Error("Please provide a valid uuid");
  }
  const user = await User.findById(userId);
  if (!user) throw Error("User does not exist");
  const settings = await Settings.findOne({ user: user._id });
  const api_keys = {
    ...settings.api_keys
  };
  return api_keys;
};
