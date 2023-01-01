const crypto = require('crypto');

const createPaymentSlug = async (pageName) => {
    const randomDigits = crypto.randomBytes(3).toString('hex');
    const slug = new String( pageName.split(' ').join('-') ).toLowerCase();
    const newSlug = `${slug}-${randomDigits}`
    return newSlug;
};

module.exports = createPaymentSlug;