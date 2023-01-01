const jwtExpress = require('express-jwt');
const { errorResMsg } = require('../utils/libs/response');

const secret = process.env.PAYERCOINS_ACCESS_TOKEN_SECRET;

// Check if your are authorized for the route
const authorize = (roleIds = []) => {
  if (typeof roleIds === 'string') {
    // eslint-disable-next-line no-param-reassign
    roleIds = [roleIds];
  }

  return [
    // authenticate JWT token and attach user to request object (req.user)
    jwtExpress({ secret, algorithms: ['HS256'] }),

    // authorize based on user role
    (req, res, next) => {
      if (roleIds.length && !roleIds.includes(req.user.adminRole)) {
        // user's role is not authorized
        return errorResMsg(
          res,
          401,
          `Admin Role: ${req.user.adminRole} does not have permission to perform this action or access this route`
        );
      }

      // authentication and authorization successful
      next();
      return false;
    },
  ];
};

module.exports = {
  authorize,
};