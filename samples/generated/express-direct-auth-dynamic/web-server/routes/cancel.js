const express = require('express');
const { getAuthClient, handleTransaction } = require('../utils');

const router = express.Router();

router.post('/cancel', async (req, res, next) => {
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.cancel();
  handleTransaction({ req, res, next, authClient, transaction });
});

module.exports = router;
