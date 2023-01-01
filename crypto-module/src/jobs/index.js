const { QueueScheduler } = require('bullmq')

const walletAction = require('./wallet-action-job')
const tresholdWebhook = require('./treshold-webhook-job')
const sendMail = require('./send-mail-job')
const sendWebhook = require('./send-webhook-job')
const sendPushNortification = require('./send-push-notification-job')
const { redisConnectionString } = require('../utils/libs/redis');


const tresholdWebhookScheduler = new QueueScheduler('treshold-webhook', redisConnectionString());

const walletActionScheduler = new QueueScheduler('wallet-action', redisConnectionString());

const sendMailScheduler = new QueueScheduler('mails-send', redisConnectionString());

const pycWebhookScheduler = new QueueScheduler('send-webhook', redisConnectionString());

console.log(`Started workers: ${walletAction.name}, ${sendMail.name}, ${sendPushNortification.name}, ${tresholdWebhook.name} and ${sendWebhook.name}`);