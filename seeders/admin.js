const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Admin = require("../models/adminModel");

dotenv.config();

const DB = process.env.PAYERCOINS_DB.replace(
  "<password>",
  process.env.PAYERCOINS_PASSWORD
);

const Database = {
  async connect() {
    try {
      const db = await mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      console.log("Database Connected");
      return db;
    } catch (error) {
      console.log("Error connecting to DB");
      throw error;
    }
  },
};
const admin = {
  firstName: "Olalemi",
  lastName: "Solomon",
  isVerified: true,
  role: "ROL-SUPERADMIN",
  email: "olalemis@gmail.com",
  password: "Olalemis@123",
};

const AdminSeeder = async () => {
  try {
    const db = await Database.connect();
    await Admin.create(admin);
    await db.disconnect();
  } catch (error) {
    console.log(`**AddAdmin** has error: ${error}`);
  }
};

AdminSeeder().then(() => console.log("Super Admin Inserted"));
