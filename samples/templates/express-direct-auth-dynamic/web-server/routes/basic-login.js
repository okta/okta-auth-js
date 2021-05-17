const express = require('express');
const { 
  getAuthClient, 
  handleTransaction,
  redirect,
  renderEntryPage,
} = require('../utils');

const router = express.Router();

const proceed = ({ nextStep, req, res }) => {
  const { name } = nextStep;
  switch (name) {
    case 'identify':
      redirect({ req, res, path: '/basic-login' });
      return true;
    default:
      return false;
  }
};

router.get('/basic-login', renderEntryPage);

router.post('/basic-login', async (req, res, next) => {
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({ 
    username, 
    password,
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

module.exports = router;
