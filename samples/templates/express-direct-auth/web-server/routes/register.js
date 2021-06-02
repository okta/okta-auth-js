const express = require('express');
const { 
  getAuthClient,
  handleTransaction,
  renderTemplate,
} = require('../utils');

const router = express.Router();

// entry route
router.get('/register', (req, res) => {
  req.setFlowStates({
    entry: '/register',
    idxMethod: 'register'
  });

  renderTemplate(req, res, 'enroll-profile', {
    action: '/register'
  });
});

router.post('/register', async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.register({ 
    firstName, 
    lastName, 
    email,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

module.exports = router;
