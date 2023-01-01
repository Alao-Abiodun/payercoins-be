const { Queue, Worker } = require('bullmq');
let Pusher = require('pusher');
const config = require('../../config/index');
const { redisConnectionString } = require('../utils/libs/redis');

let pusher = new Pusher({
  appId: config.pusher.appId,
  key: config.pusher.key,
  secret: config.pusher.secret,
  cluster: config.pusher.cluster
});

module.exports = new Worker(
  'send-push-notification',
  async (job) => {
    console.log(`Processing Send Push Notification of job id: ${job.id} of type: ${job.name}`);
    console.log('------- PUSH NOTIFICATION TYPE ------', job.data.type);
    if(job.data.type === 'page') {
      pusher.trigger(`payment-notification-${job.data.environment}`, `payment-${job.data.taskData.identifier}`, {
        data: job.data.taskData
      });
    } else {
      console.log('------- sendPushNotification has been triggered -------');
      pusher.trigger('invoice-payment-notification', `payment-${job.data.taskData.identifier}`, {
        data: job.data.taskData
      });
    }

    
  },
  redisConnectionString()
);