const getAuthClient = require('./getAuthClient');

module.exports = async function getTransactionMeta(req, options = {}) {
  const state = req.transactionId;
  const authClient = getAuthClient(req);
  const meta = await authClient.idx.getTransactionMeta({
    state,
    ...options
  });
  authClient.idx.saveTransactionMeta(meta);
  return meta;
};
