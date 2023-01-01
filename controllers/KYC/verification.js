require('dotenv').config();
const catchAsync = require('../../utils/libs/catchAsync');
const AppError = require('../../utils/libs/appError');
const { successResMsg } = require('../../utils/libs/response');
const axiosCall = require('../../utils/libs/axiosCall');
const User = require('../../models/userModel');
const Business = require('../../models/businessModel');

const moment = require('moment');



const ninCheck = async (requestBody) => {
  const ninLookUp = await axiosCall({
    method: 'post',
    url: `${process.env.PAYERCOINS_MYIDENTITYPASS_BASE_URL}/api/v1/biometrics/merchant/data/verification/nin_wo_face`,
    data: requestBody,
    headers: {
      'x-api-key': `${process.env.PAYERCOINS_MYIDENTITYPASS_SECRET_KEY}`,
    }
  }); 

  return ninLookUp;
}

const intlPassportCheck = async (requestBody) => {
  const intlPassportLookUp = await axiosCall({
    method: 'post',
    url: `${process.env.PAYERCOINS_MYIDENTITYPASS_BASE_URL}/api/v1/biometrics/merchant/data/verification/national_passport}`,
    data: requestBody,
    headers: {
      'x-api-key': `${process.env.PAYERCOINS_MYIDENTITYPASS_SECRET_KEY}`,
    }
  }); 

  return intlPassportLookUp;
}

const votersCardCheck = async (requestBody) => {
  const votersCardLookUp = await axiosCall({
    method: 'post',
    url: `${process.env.PAYERCOINS_MYIDENTITYPASS_BASE_URL}/api/v1/biometrics/merchant/data/verification/voters_card`,
    data: requestBody,
    headers: {
      'x-api-key': `${process.env.PAYERCOINS_MYIDENTITYPASS_SECRET_KEY}`,
    }
  }); 

  return votersCardLookUp;
}

const driversLicenseCheck = async (requestBody) => {
  const driversLicenseLookUp = await axiosCall({
    method: 'post',
    url: `${process.env.PAYERCOINS_MYIDENTITYPASS_BASE_URL}/api/v1/biometrics/merchant/data/verification/drivers_license`,
    data: requestBody,
    headers: {
      'x-api-key': `${process.env.PAYERCOINS_MYIDENTITYPASS_SECRET_KEY}`,
    }
  }); 

  return driversLicenseLookUp;
}

const basciCACCheck = async (requestBody) => {
  const basciCACLookUp = await axiosCall({
    method: 'post',
    url: `${process.env.PAYERCOINS_MYIDENTITYPASS_BASE_URL}/api/v1/biometrics/merchant/data/verification/cac`,
    data: requestBody,
    headers: {
      'x-api-key': `${process.env.PAYERCOINS_MYIDENTITYPASS_SECRET_KEY}`,
    }
  }); 

  return basciCACLookUp;
}


exports.verifyIndividual = catchAsync(async (req, res, next) => {

  if (req.user.isUserVerified === true) return successResMsg(res, 200, {message: 'User KYC is already verified'});

  const { identificationType } = req.params;
  const userData = req.user;
  const userFName = `${userData.firstName} ${userData.lastName}`;
  const userFullName = userFName.toLowerCase();

  console.log({identificationType});


  switch (identificationType) {
    
    case 'NIN':
        const { ninNumber } = req.body;
        const reqBody = { number: ninNumber };
        const ninLookUp = await ninCheck(reqBody);

        if (ninLookUp.status === '02'  || ninLookUp.status === '03') {
          return next(new AppError('Service Downtime. Check back later', 400));
        }

        if (ninLookUp.status === true  && ninLookUp.response_code === '00') {
          // instantiate the ninlook up nin dataa into a new object
          const ninLookUpResponseData = ninLookUp.nin_data;
          const ninLookUpFirstName = ninLookUpResponseData.firstname.toLowerCase();
          const ninLookUpLastName = ninLookUpResponseData.surname.toLowerCase();
          const ninLookUpName = `${ninLookUpResponseData.firstname} ${ninLookUpResponseData.surname}`;
          const ninLookUpFullName = ninLookUpName.toLowerCase();

          console.log({ninLookUpFullName, userFullName});
          
          if ((userFullName.includes(ninLookUpFirstName) && userFullName.includes(ninLookUpLastName)) || (ninLookUpFullName === userFullName) ) {
            // if the data is the same as the user data, then return success
            const updatedUser = await User.findByIdAndUpdate(userData._id, {
              isUserVerified: true,
            } , { new: true });
            const dataInfo = {
              message: 'User KYC verified successfully',
              updatedUser
            }
            return successResMsg(res, 200, dataInfo);
          }
          return next(new AppError('Verification Failed, Make sure the first name and lastname on id matches what is on your payercoins account', 400));
        } else {
          return next(new AppError('Invalid NIN Number', 400));
        }
      break;
    case 'PASSPORT':
        const { passportNumber, firstName, lastName, dateOfBirth } = req.body;

        const reqBodyPassport = {
          number: passportNumber,
          first_name: firstName, 
          last_name: lastName, 
          dob: dateOfBirth
        }

        const intlPassportLookUp = await intlPassportCheck(reqBodyPassport);
        console.log('==================intlPassportLookUp')
        console.log(intlPassportLookUp);
        console.log('==================intlPassportLookUp')

        if (intlPassportLookUp.status === '02'  || intlPassportLookUp.status === '03') {
          return next(new AppError('Service Downtime. Check back later', 400));
        }

        if (intlPassportLookUp.status === true  && intlPassportLookUp.response_code === '00') {
          // instantiate the ninlook up nin dataa into a new object
          const intPLookUpResponseData = intlPassportLookUp.data;
          const intPLookUpFirstName = intPLookUpResponseData.first_name.toLowerCase();
          const intPLookUpLastName = intPLookUpResponseData.last_name.toLowerCase();
          const intPLookUpName = `${intPLookUpFirstName} ${intPLookUpLastName}`;
          const intPLookUpFullName = intPLookUpName.toLowerCase();

          console.log({intPLookUpFullName, userFullName});
          
          if ((userFullName.includes(intPLookUpFirstName) && userFullName.includes(intPLookUpLastName)) || (intPLookUpFullName === userFullName) ) {

            // check if intP expiry date is greater than today
            const intPExpiryDate = new Date(intPLookUpResponseData.expiry_date);
            const today = new Date();
            if (intPExpiryDate > today) {
                // if the data is the same as the user data, then return success
                const updatedUser = await User.findByIdAndUpdate(userData._id, {
                  isUserVerified: true,
                } , { new: true });
                const dataInfo = {
                  message: 'User KYC verified successfully',
                  updatedUser
                }
                return successResMsg(res, 200, dataInfo);
            }

          }
          return next(new AppError('Verification Failed, Make sure the Name on your ID matches what is on your payercoins account', 400));
        } else {
          return next(new AppError('Invalid Intl Passport Credentials', 400));
        }

      break;
    case 'VOTERS_CARD':
        const { votersCardNumber, lastNameVoters, votersState } = req.body;

        const reqBodyVoters = {
          number: votersCardNumber,
          last_name: lastNameVoters,
          state: votersState
        }

        const votersCardLookUp = await votersCardCheck(reqBodyVoters);

        if (votersCardLookUp.status === '02'  || votersCardLookUp.status === '03') {
          return next(new AppError('Service Downtime. Check back later', 400));
        }

        if (votersCardLookUp.status === true  && votersCardLookUp.response_code === '00') {
          // instantiate the ninlook up nin dataa into a new object
          const vcLookUpResponseData = votersCardLookUp.vc_data;
          const vcLookUpFullName = vcLookUpResponseData.fullName.toLowerCase();

          console.log({vcLookUpFullName, userFullName});
          
          if ((vcLookUpFullName.includes(userFullName) && vcLookUpFullName.includes(userFullName)) || (vcLookUpFullName === userFullName) ) {
                // if the data is the same as the user data, then return success
                const updatedUser = await User.findByIdAndUpdate(userData._id, {
                  isUserVerified: true,
                } , { new: true });
                const dataInfo = {
                  message: 'User KYC verified successfully',
                  updatedUser
                }
                return successResMsg(res, 200, dataInfo);

          }
          return next(new AppError('Verification Failed, Make sure the Name on your ID matches what is on your payercoins account', 400));
        } else {
          return next(new AppError('Invalid Voter\'s Card Details ', 400));
        }

      break;
    case 'DRIVERS_LICENSE':
        const { driversLicenseNumber, dLdateOfBirth } = req.body;
        
        const reqBodyDrivers = {
          number: driversLicenseNumber.toUpperCase(),
          dob: dLdateOfBirth
        }

        const driversLicenseLookUp = await driversLicenseCheck(reqBodyDrivers);

        if (driversLicenseLookUp.status === '02'  || driversLicenseLookUp.status === '03') {
          return next(new AppError('Service Downtime. Check back later', 400));
        }

        if (driversLicenseLookUp.status === true  && driversLicenseLookUp.response_code === '00') {
          // instantiate the ninlook up nin dataa into a new object
          const dlLookUpResponseData = driversLicenseLookUp.frsc_data;
          const dlLookUpFirstName = dlLookUpResponseData.firstName.toLowerCase();
          const dlLookUpLastName = dlLookUpResponseData.lastName.toLowerCase();
          const dlLookUpName = `${dlLookUpFirstName} ${dlLookUpLastName}`;
          const dlLookUpFullName = dlLookUpName.toLowerCase();

          console.log({dlLookUpFullName, userFullName});
          
          if ((userFullName.includes(dlLookUpFirstName) && userFullName.includes(dlLookUpLastName)) || (dlLookUpFullName === userFullName) ) {

            // check if dl expiry date is greater than today
            const dlExpiryDate = new Date(dlLookUpResponseData.expiryDate);
            const today = new Date();
            if (dlExpiryDate > today) {
                // if the data is the same as the user data, then return success
                const updatedUser = await User.findByIdAndUpdate(userData._id, {
                  isUserVerified: true,
                } , { new: true });
                const dataInfo = {
                  message: 'User KYC verified successfully',
                  updatedUser
                }
                return successResMsg(res, 200, dataInfo);
            }

          }
          return next(new AppError('Verification Failed, Make sure the Name on your ID matches what is on your payercoins account', 400));
        } else {
          return next(new AppError('Invalid Driver\'s License Details ', 400));
        }

      break;
    default:
      break;
  }


})

exports.verifyBusiness = catchAsync(async (req, res, next) => {
  try {

    if (req.user.isUserVerified === false) return successResMsg(res, 200, {message: 'Kindly Veirfy the User Account, first'});
    const business = await Business.findOne({user: req.user.id});
    console.log({business});

    if (business.isBusinessVerified === true) return successResMsg(res, 200, {message: 'Business already verified'});



    const  { rcNumber, companyName } = req.body;

    const reqBody = { 
      rc_number: rcNumber,
      company_name: companyName 
    };

    console.log({reqBody});

    const cacCheck = await basciCACCheck(reqBody);

    console.log({cacCheck});

    if (cacCheck.status === '02'  || cacCheck.status === '03') {
      return next(new AppError('Service Downtime. Check back later', 400));
    }

    if (cacCheck.status === true  && cacCheck.response_code === '00') {
      // instantiate the ninlook up nin dataa into a new object
      const cacCheckResponseData = cacCheck.data;
      const cacCheckFullName = cacCheckResponseData.company_name.toLowerCase();

      console.log({cacCheckFullName});
      
      if (cacCheckFullName === business.businessName.toLowerCase()) {
        // if the data is the same as the user data, then return success
        const updatedBusiness = await Business.findByIdAndUpdate(business._id, {
          isBusinessVerified: true,
        } , { new: true });
        const dataInfo = {
          message: 'Business KYC verified successfully',
          updatedBusiness
        }
        return successResMsg(res, 200, dataInfo);
      }
      return next(new AppError('Verification Failed, Make sure the first name and lastname on id matches what is on your payercoins account', 400));
    } else {
      return next(new AppError('Invalid Information', 400));
    }
    
  } catch (error) {
    
  }
})