var crypto = require("crypto");

const generateString = (len) => { 
  return crypto.randomBytes(len).toString('hex');
}

module.exports = {
    generateString
}