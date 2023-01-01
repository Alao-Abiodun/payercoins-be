const { Queue } = require('bullmq');
const { redisConnectionString } = require('../utils/libs/redis');

module.exports = (configs, environment) => async (req, res, next) => {

    const tresholdWebhook = new Queue('treshold-webhook', redisConnectionString());
    // console.log('--- threshold webhook response ---');
    // console.log(req.body);

    // console.log('=== End threshold ===');

    const taskData = req.body;

    console.log(`Received Treshold Webhook task to process...`);

    tresholdWebhook
        .add('treshold-webhook', { environment, taskData })
        .then(
            (job) => {
                console.log(`Job Has been added to Queue`);
                return res.status(200).send('OK');
            },
            (err) => {
                return res.status(500).json({ message: 'webhook failed', error: err });
            }
        );
}