const {
    getUserDetailsByUuid,
    getUserTransactionFeePrefereenceByUuid
} = require('./controllers/users/helper');

/*get user email by uuid*/
const a = async () => {
    const email = await getUserDetailsByUuid('44254b62-4840-4936-ab5b-603e863cbc97');
    console.log(email);
}
a();

/*get user transaction preference by uuid
const b = async () => {
    const pref = await getUserTransactionFeePrefereenceByUuid('44254b62-4840-4936-ab5b-603e863cbc97');
    console.log(pref);
}
b();*/