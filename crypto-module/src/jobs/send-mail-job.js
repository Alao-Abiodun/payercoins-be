const { Queue, Worker } = require("bullmq");
const mailer = require("../../../utils/libs/email");
const ejs = require("ejs");
const path = require("path");
const { redisConnectionString } = require("../utils/libs/redis");

module.exports = new Worker(
  "mails-send",
  async (job) => {
    console.log(
      `Processing Mail Send of job id: ${job.id} of type: ${job.name}`
    );

    const data = job.data.taskData;
    let body, title, currency;

    if (data.currency == "TRX-USDT-TRC20") {
      currency = "USDT (TRC20)";
    } else if (data.currency == "ETH-USDT-ERC20") {
      currency = "USDT (ERC20)";
    } else if (data.currency == "BSC-BUSD") {
      currency = "BUSD";
    } else {
      currency = data.currency;
    }

    // console.log('---- Mail Job data ----');
    // console.log(job);

    if (
      data.event === "PAYMENT_COMPLETED" &&
      data.type === "payment-page-transaction:merchant"
    ) {
      title = "A new payment has been received";
      let date = new Date();
      let new_date = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
      body = `
        Payment from ${data.info.metaData.name} was successful. 
        <br>
        <h2>${parseFloat(data.info.amountInCrypto)} ${currency}</h2> 
        <br>
        PAYMENT DETAILS
        <br><br>
        Date: ${new_date}
        <br>
        Transaction ID: <small>${data.info.uuid}</small>
        <br><br>
        <a href="https://app.payercoins.com">Head to your dashboard</a> to see more information on this payment.
        <br><br>
        Have questions or need help? Please contact us.
        <br>
      `;
      /*
      body = `
        Payment of <strong>${parseFloat(data.info.amountInCrypto)} ${currency}</strong> 
        from ${data.info.metaData.name} was successful on ${new_date}.
        <br><br>
        <strong>Transaction ID: <small>${data.info.uuid}</small> </strong>
        <br><br>
        Head to your dashboard to see more information on this payment.
        <br>
        Have questions or need help? Please visit our FAQ page or contact 
        <a href="mailto:support@payercoins.com">support@payercoins.com</a>
        <br>
      `;
      */
    } else if (
      data.event === "PAYMENT_COMPLETED" &&
      data.type === "payment-page-transaction:customer"
    ) {
      title = "Your Payment Receipt";
      let date = new Date();
      let new_date = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
      body = `
      You just paid <strong>${parseFloat(
        data.info.amountInCrypto
      )} ${currency}</strong> and it has been 
      received by the merchant successfully!
      <br><br>
      TRANSACTION DETAILS
      <br><br>
      Date: ${new_date}
      <br>
      Transaction ID: <small>${data.info.uuid}</small>
      <br><br>
      If you didn’t initiate this payment, kindly contact us immediately.
      <br>
      `;
    } else if (
      data.event === "PAYMENT_INCOMPLETE" &&
      data.type === "payment-page-transaction:merchant"
    ) {
      title = "You Have An Incomplete Payment";
      let date = new Date();
      let new_date = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
      body = `
      Payment from <strong>${
        data.info.metaData.name
      }</strong> was successful, but a payment of 
      <strong>${parseFloat(
        data.info.totalAmountInCrypto
      )} ${currency}</strong>  
      was made instead of <strong>${parseFloat(
        data.info.amountInCrypto
      )} ${currency}</strong> 
        <br><br>
        PAYMENT DETAILS
        <br><br>
        Date: ${new_date}
        <br>
        Amount Paid: ${parseFloat(data.info.totalAmountInCrypto)} ${currency}
        <br>
        Transaction ID: <small>${data.info.uuid}</small>
        <br><br>
        Kindly contact the customer to complete this payment.
        <br><br>
        Have questions or need help? Please reach out to us.
        <br>
      `;
    } else if (
      data.event === "PAYMENT_INCOMPLETE" &&
      data.type === "payment-page-transaction:customer"
    ) {
      title = "You Made An Incomplete Payment";
      let date = new Date();
      let new_date = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
      body = `
      Your payment of <strong>${parseFloat(
        data.info.amountInCrypto
      )} ${currency}</strong> was successful, 
      kindly complete this payment with <strong>${parseFloat(
        data.info.amountToBalance
      )} ${currency}</strong> to avoid consequences.
        <br><br>
        PAYMENT DETAILS
        <br><br>
        Date: ${new_date}
        <br>
        Amount Paid: ${parseFloat(data.info.amountInCrypto)} ${currency}
        <br>
        Amount To Balance: ${parseFloat(data.info.amountToBalance)} ${currency}
        <br>
        Transaction ID: <small>${data.info.uuid}</small>
        <br><br>
        Have questions or need help? Please reach out to us.
        <br>
      `;
    } else if (data.type === "wallet-deposit") {
      title = "You Just Made A Deposit!";
      let date = new Date();
      let new_date = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
      body = `
        Your ${currency} wallet has been successfully credited with:
        <br>
        <h2>${parseFloat(data.info.amount)} ${currency}</h2>
        <br>
        TRANSACTION DETAILS
        <br><br>
        Date: ${new_date}
        <br>
        Transaction ID: <small>${data.info.uuid}</small>
        <br><br>
        Have questions or need help? Please contact us 
        <br>
      `;
    } else if (data.type === "wallet-withdrawal") {
      title = "Withdrawal Successful";
      let date = new Date();
      let new_date = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
      body = `
        We paid your total settlement from your wallet based on your withdrawal request
        <br>
        <h2>${parseFloat(data.info.amount)} ${currency}</h2>
        <br>
        PAYMENT DETAILS
        <br>
        Date: ${new_date}
        <br>
        Transaction ID: <small>${data.info.uuid}</small>
        <br><br>
        <a href="https://app.payercoins.com">Head to your dashboard</a> to see all the transactions that made up this settlement.
        <br>
        If you didn’t request this withdrawal, kindly contact us immediately.
        <br>
      `;
    } else if (data.type === "webhook-failed") {
      title = "Webhook Failed";
      body = `
        Webhook failed for invoice: ${data.info.uuid} <br>
        Reason: ${data.info.reason} <br>
        Below is the webhook data:
        <br><br>
        <pre>
          ${JSON.stringify(data.info.data)}
        </pre>
        <br><br>
        <a href="https://app.payercoins.com">Head to your dashboard</a> to see more information on this payment.
        <br>
        Have questions or need help? Please contact us.
        <br>
      `;
    }

    ejs.renderFile(
      path.join(__dirname, "../../../views/email-template.ejs"),
      {
        salutation: `Hello`,
        body: body,
      },
      async (err, file) => {
        //use the data here as the mail body
        const options = {
          email: data.email,
          subject: title,
          message: file,
        };
        await mailer(options);
      }
    );
  },
  redisConnectionString()
);
