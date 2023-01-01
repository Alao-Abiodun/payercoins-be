const { Queue, Worker } = require('bullmq');
const { redisConnectionString } = require('../utils/libs/redis');
const axios = require('axios').default;

const mailSend = new Queue('mails-send', redisConnectionString());

function createHmacSignature(reqBody, secretKey) {
  return require("crypto")
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(reqBody))
    .digest("hex");
}

module.exports = new Worker(
  'send-webhook',
  async (job) => {
    console.log(`Processing Send Webhook Notification of job id: ${job.id} of type: ${job.name}`);

    const data = job.data.taskData;
    let environment =job.data.environment;

    try {
      // get the webhook url using invoice id
      let invoice_id = data.paymentLink.metaData.invoiceId;
      let callback_url = data.paymentLink.metaData.callbackUrl;
      let respData = {
        status: 'successful',
        invoice_id,
        currency: data.crypto.symbol,
        payment_type: data.paymentLink.type,
        transactionId: data.paymentLink.uuid,
        amountInCrypto: data.paymentLink.paymentLinkTransaction.amountInCrypto,
        confirmedAmountInCrypto: data.paymentLink.paymentLinkTransaction.confirmedAmountInCrypto,
        amountInUsd: data.paymentLink.paymentLinkTransaction.amountInUsd,
        confirmedAmountInUsd: data.paymentLink.paymentLinkTransaction.confirmedAmountInUsd,
      }

      let response = await axios.post(callback_url, respData, {
        headers: {
          'Content-Type': 'application/json',
          'x-pyc-signature': createHmacSignature(respData, data.merchantSecretKey),
        }
      });
      // check for response status
      if (response.status === 200) {
        // send a mail to the merchant if response body from webhook is not OK
        if(!response.data === 'OK') {
          // webhook fails 
          mailSend.add('mails-send', {
            environment: environment,
            taskData: {
                type: 'webhook-failed',
                event: 'WEBHOOK_NOTIFICATION',
                email: data.merchantEmail,
                currency: 'currency',
                info: {
                  reason: 'Response body is not "OK"',
                  data: data
                }
            }
          });
        }
      } else {
        // send mail to merchant
          //console.log(response);
          mailSend.add('mails-send', {
            environment: environment,
            taskData: {
                type: 'webhook-failed',
                event: 'WEBHOOK_NOTIFICATION',
                email: data.merchantEmail,
                currency: 'currency',
                info: {
                  reason: 'Response status code is not 200',
                  data: data
                }
            }
          });
      }
    } catch (error) {
      // if webhook fails send a mail to the merchant
      mailSend.add('mails-send', {
        environment: environment,
        taskData: {
            type: 'webhook-failed',
            event: 'WEBHOOK_NOTIFICATION',
            email: data.merchantEmail,
            currency: 'currency',
            info: {
              reason: 'Response status code is not 200',
              data: data
            }
        }
      });
      //console.log(error);
    }

    // if webhook fails send a mail to the merchant

    // return mailSend.add(
    //   job.name,
    //   { userId: job.data.userId, result },
    //   {
    //     attempts: config.maxAttempts,
    //     backoff: { type: "exponential", delay: config.backoffDelay },
    //   }
    // );
  },
  redisConnectionString()
);
