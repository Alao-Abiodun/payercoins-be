const ManuallyUpdatedDepositTransaction = require('../../models/manuallyUpdatedDepositTransaction');

// Create a database entry for the manually completed deposit transaction
const saveManualDepositTransaction = async (
  transaction_id,
  transaction_type,
  previous_balance,
  current_balance,
  crypto_wallet_id
) => {
  return await ManuallyUpdatedDepositTransaction.create({
    transaction_id,
    transaction_type,
    previous_balance,
    current_balance,
    crypto_wallet_id,
  });
};

module.exports = saveManualDepositTransaction;
