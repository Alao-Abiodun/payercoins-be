require("dotenv").config();
const mongoose = require("mongoose"),
  Rate = require("../../models/rateModel");

exports.getRate = async (env) => {
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
  if (!env) {
    throw Error("Please provide a valid environment");
  }

  const { rates } = await Rate.findOne({ owner: env });

  if (!rates) throw Error("Rate not found");

  return rates.ngn;
};


