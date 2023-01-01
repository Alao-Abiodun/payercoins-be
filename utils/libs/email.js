const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.PAYERCOINS_SMTP_HOST,
    port: process.env.PAYERCOINS_SMTP_PORT,
    auth: {
      user: process.env.PAYERCOINS_SMTP_USER,
      pass: process.env.PAYERCOINS_SMTP_PASSWORD,
    },
  });
  const message = {
    from: `${process.env.PAYERCOINS_EMAIL_FROM_NAME} <${process.env.PAYERCOINS_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
