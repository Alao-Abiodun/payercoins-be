require('../../../config/index');

// Redis connection string - currently using redis enterprise
const redisConnectionString = () => {
  return {
    connection: {
      host: process.env.PAYERCOINS_REDIS_HOST,
      port: process.env.PAYERCOINS_REDIS_PORT,
      password: process.env.PAYERCOINS_REDIS_DB_PASSWORD,
    },
  };
};

module.exports = {
  redisConnectionString,
};
