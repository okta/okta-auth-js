const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.get('/signup', (_, res) => {
  res.render('signup');
});

router.post('/signup', (req, res) => {
  const authClient = getAuthClient();
  authClient.idx.interact()
    .then(({ idxResponse }) => {
      console.log('interact resp -> ', idxResponse.neededToProceed);
      return idxResponse.proceed('select-enroll-profile', {});
    })
    .then(idxResponse => {
      console.log('idxResponse -> ', idxResponse);
    })
    .catch(err => {
      console.log('err ->', err, err.messages);
    });
});

module.exports = router;
