// @ts-nocheck
/* eslint-disable no-console */

const OktaAuthJS = require('@okta/okta-auth-js').OktaAuth;

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const mustacheExpress = require('mustache-express');
const path = require('path');
// const { logout } = require('@okta/oidc-middleware');
const logout = require('./logout');

const templateDir = path.join(__dirname, '', 'views');
const frontendDir = path.join(__dirname, '', 'assets');

// const sampleConfig = require('../config.js').webServer;
const sampleConfig = {
  port: 8080,
  oidc: {
    clientId: '0oa59ub6S60VLNhO14w4',
    clientSecret: 'A6z9HS2m2XfCPJkT1bTS_tIHcZWqmjwb_QvYBOJY',
    issuer: 'https://shuo03.clouditude.com',
    appBaseUrl: 'http://localhost:8080',
    scope: 'openid profile email',
    redirectUri: 'http://localhost:8080/login/callback',
    logoutRedirectUri: 'http://localhost:8080'
  },
};

function createAuthClient() {
  return new OktaAuthJS(sampleConfig.oidc);
}

passport.use(new Strategy(
  async function(username, password, cb) {
    const authClient = createAuthClient();
    try {
      const { data: 
        { tokens: { tokens } } 
      } = await authClient.idx.authenticate({ username, password });
      const { accessToken, idToken } = tokens;
      const userinfo = await authClient.token.getUserInfo(accessToken, idToken);
      cb(null, { userinfo, tokens });
    } catch (err) {
      cb(err, null);
    }
  }));

passport.serializeUser(function(userContext, cb) {
  cb(null, userContext);
});

passport.deserializeUser(function(userContext, cb) {
  cb(null, userContext);
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ 
  secret: 'this-should-be-very-random', 
  resave: true, 
  saveUninitialized: false
}));
app.use(passport.initialize({ userProperty: 'userContext' }));
app.use(passport.session());

// Provide the configuration to the view layer because we show it on the homepage
const displayConfig = Object.assign(
  {},
  sampleConfig.oidc,
  {
    clientSecret: '****' + sampleConfig.oidc.clientSecret.substr(sampleConfig.oidc.clientSecret.length - 4, 4)
  }
);

app.locals.oidcConfig = displayConfig;

// This server uses mustache templates located in views/ and css assets in assets/
app.use('/assets', express.static(frontendDir));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', templateDir);

app.get('/', (req, res) => {
  const userinfo = req.userContext && req.userContext.userinfo;
  res.render('home', {
    isLoggedIn: !!userinfo,
    userinfo
  });
});

app.get('/signin', (_, res) => {
  res.render('signin');
});

app.post('/signin',
  passport.authenticate('local', { failureRedirect: '/login' }), 
  (_, res) => {
    res.redirect('/');
  });

app.get('/signup', (_, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const authClient = createAuthClient();
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


app.get('/profile', 
  (req, res, next) => {
    if (req.userContext && req.userContext.userinfo) {
      next();
    } else {
      res.redirect('/login');
    }
  },
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

app.post('/logout', logout.forceLogoutAndRevoke({ options: sampleConfig.oidc }));

app.listen(8080, () => {
  console.log('on port 8080');
})
