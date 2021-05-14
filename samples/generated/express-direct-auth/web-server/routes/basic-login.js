const express = require('express');
const { 
  getAuthClient, 
  handleAuthTransaction,
  renderTemplate,
  redirect,
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

router.get('/basic-login', (req, res) => {
  renderTemplate(req, res, 'basic-login', { 
    action: '/basic-login'
  });
});

router.post('/basic-login', async (req, res, next) => {
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.authenticate({ 
    username, 
    password,
  });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

module.exports = router;
