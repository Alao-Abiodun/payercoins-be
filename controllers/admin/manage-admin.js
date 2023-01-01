const generator = require('generate-password');
const ejs = require('ejs');
const path = require('path');
const Admin = require('../../models/adminModel');
const sendEmail = require('../../utils/libs/email');
const { successResMsg, errorResMsg } = require('../../utils/libs/response');

const {
  signAccessToken,
  verifyAccessToken,
} = require('../../utils/libs/jwt-helper');
const { count } = require('../../models/adminModel');

const URL =
  process.env.NODE_ENV === 'development'
    ? process.env.PAYERCOINS_FRONT_END_DEV_URL
    : process.env.PAYERCOINS_FRONT_END_LIVE_URL;

const generatePassword = () => {

  const passwordGenerated = generator.generate({
    length: 15,
    numbers: true,
    lowercase: true,
    uppercase: true,
  });

  return passwordGenerated;
} 

module.exports = {
  addAdminUser: (req, res) => {
    (async () => {
      try {
        const { email, firstName, lastName, invitedBy} = req.body;

        const userExists = await Admin.findOne({ email }).select('+password');
        if (userExists) {
          return errorResMsg(res, 400, 'Email already exists');
        }
  
        const adminPassword = generatePassword();
  
        const adminUser = await Admin.create({
          firstName,
          lastName,
          email,
          password: adminPassword,
          invitedBy,
        });
  
        if (!adminUser) {
          return errorResMsg(res, 409, 'User already exist!');
        }

         // generate admin verification token
         const userData = {
          email: email,
        }
        
        const token = signAccessToken(userData);
        const verificationUrl = `${URL}/admin/auth/email/verify/?verification_token=${token}`;

        ejs.renderFile(
          path.join(__dirname, '../../views/email-template.ejs'), {
            salutation: `Hello ${req.body.firstName}`,
            body: `<p>Welcome, we're glad to have you 🎉🙏,\n </p>
            <p>Here is your Account Information, \n <p>
            <p>First Name: ${firstName} \n</p>
            <p>Last Name: ${lastName} \n</p>
            <p>Email: ${email} \n</p>
            <p>Password: ${adminPassword} \n </p>
            <p>Kindly Click the link to verify your email \n <p> 
            <a href=${verificationUrl}>Activate My Account</a>`,
          },
          async (err, data) => {
              //use the data here as the mail body
              const options = {
                email: req.body.email,
                subject: 'Admin Account creation!!',
                message: data,
              };
              await sendEmail(options);
          }
      );
  
        const dataInfo = { 
          message: 'Hello, Admin account has been successfully created!' 
        }; 


        return successResMsg(res, 201, dataInfo);

      } catch (error) {
        console.log(`**AddAdmin** has error: ${error}`);
        return errorResMsg(res, 500, 'Something went wrong');
      }
    })();
  },

  getAdminUsers: (req, res) => {
    (async () => {
      try {

        const { page, limit} = req.query;

        const adminUsers = await Admin.find({})
              .limit(limit * 1)
              .skip((page - 1) * limit)
              .exec();

        if(!adminUsers) return successResMsg(res, 200, { message: "Admin User"} )
              
        const count = await adminUsers.countDocuments();
        
        const dataInfo = {
          adminUsers,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        }

        return successResMsg(res, 200, dataInfo);
      } catch (error) {
        console.log(`**getAdminUsers** has error: ${error}`);
        return errorResMsg(res, 500, "Something went wrong");
      }
    })();
  },

  getAdminUser: (req, res) => {
    (async () => {
      try {
        const { id } = req.params;
        const user = await Admin.findOne(id).select('+block isVerified');
  
        if (!user) {
          return errorResMsg(res, 404, `User with id: ${id}, does not exist!`);
        }
  
        const dataInfo = {
          data: user
        }
        return successResMsg(res, 200, dataInfo);
      } catch (error) {
        console.log(`**getAdminUser** has error: ${error}`);
        return errorResMsg(res, 500, "Something went wrong");
      }
    })();
  },

  blockAdminUser: (req, res) => {
    (async () => {
      try {
        const { id } = req.params;
        const user = await Admin.findOne(id).select('+block');
  
        if (user === null) {
          return errorResMsg(res, 404, `User with id: ${id}, does not exist!`);
        }
  
        if (user.block) {
          return errorResMsg(res, 400, 'User is already blocked!');
        }
  
        // block user
        user.block = true;
        await user.save();
  
        const dataInfo = {
          message: 'Admin user Blocked successfully',
          data: user
        }
        return successResMsg(res, 200, dataInfo);

      } catch (error) {
        console.log(`**blockAdminUser** has error: ${error}`);
        return errorResMsg(res, 500, "Something went wrong");
      }
    })();
  },

  unBlockAdminUser: (req, res) => {
    (async () => {
      try {
        const { id } = req.params;
        const user = await Admin.findOne(id).select('+block');
  
        if (!user) {
          return errorResMsg(res, 404, `User with id: ${id}, does not exist!`);
        }
  
        if (!user.block) {
          return errorResMsg(res, 400, 'User is not blocked!');
        }
  
        // unblock user
        user.block = false;
        await user.save();
  
        const dataInfo = {
          message: 'Admin user unBlocked successfully',
          data: user
        }
        return successResMsg(res, 200, dataInfo);
      } catch (error) {
        console.log(`**unBlockAdminUser** has error: ${error}`);
        return errorResMsg(res, 500, "Something went wrong");
      }
    })();
  },

  deleteAdminUser: (req, res) => {
    (async () => {
      try {
        const { id } = req.params;
        const user = await Admin.findOne(id);
  
        if (user === null) {
          return errorResMsg(res, 404, 'User does not exist');
        }
  
        const done = await Admin.findByIdAndDelete(id);
  
        if (!done) {
          return errorResMsg(res, 500, 'Could not delete admin user');
        }
        return successResMsg(res, 200, 'Admin user deleted successfully');
      } catch (error) {
        console.log(`**deleteAdminUser** has error: ${error}`);
        return errorResMsg(res, 500, "Something went wrong");
      }
    })();
  },

};
