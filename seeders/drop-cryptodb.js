const drop = async () => {

    console.log('Dropping crypto table...');

    const livedatabase = require('../crypto-module/database/models')({ environment: 'live' });

    livedatabase.sequelize.drop();

    const sandboxdatabase = require('../crypto-module/database/models')({ environment: 'sandbox' });

    sandboxdatabase.sequelize.drop();

    console.log('Dropping Completed');
}

drop()