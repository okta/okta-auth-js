const express = require('express');
const fetch = require('node-fetch');
const { isAuthenticated } = require('../middlewares');
const sampleConfig = require('../../config').webServer;

const router = express.Router();

router.get('/profile', 
  isAuthenticated,
  (req, res) => {
    // Convert the userinfo object into an attribute array, for rendering with mustache
    const userinfo = req.userContext && req.userContext.userinfo;
    const attributes = Object.entries(userinfo);
    res.render('profile', {
      isLoggedIn: !!userinfo,
      userinfo: userinfo,
      attributes
    });
  });

router.get('/api/messages', 
  isAuthenticated, 
  (req, res) => {
    const { 
      tokens: { 
        accessToken: { accessToken } 
      } 
    } = req.userContext;
    fetch(sampleConfig.resourceServer.messagesUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(response => {
        const { status, statusText } = response;
        if (response.ok) {
          return response.json();
        }
        return res.status(status).send(statusText);
      })
      .then(({ messages }) => {
        const userinfo = req.userContext && req.userContext.userinfo;
        res.render('messages', {
          isLoggedIn: !!userinfo,
          messages,
        });
      })
      .catch(err => {
        res.send(err);
      })
  });

module.exports = router;
