/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


const { 
  getAuthClient, 
  handleTransaction,
  renderTemplate,
  routerWithCatch,
} = require('../utils');

const router = routerWithCatch();

const getIdpSemanticClass = (type) => {
  switch (type) {
    case 'GOOGLE':
      return 'google plus';
    case 'FACEBOOK':
      return 'facebook';
    default: 
    return '';
  }
};

// entry route
router.get('/login', async (req, res) => {
  req.setFlowStates({
    entry: '/login',
    idxMethod: 'authenticate'
  });

  // Delete the idp related render logic if you only want the username and password form
  const authClient = getAuthClient(req);
  const { availableSteps } = await authClient.idx.startTransaction({ state: req.transactionId });
  const idps = availableSteps 
    ? availableSteps
      .filter(({ name }) => name === 'redirect-idp')
      .map(({ href, idp: { name }, type }) => ({
        name,
        href,
        class: getIdpSemanticClass(type),
        id: type.toLowerCase()
      }))
    : [];

  renderTemplate(req, res, 'login', { 
    action: '/login',
    hasIdps: !!idps.length,
    idps,
  });
});

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({ 
    username,
    password,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

router.get('/login/callback', async (req, res, next) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const authClient = getAuthClient(req);
  try {
    // Exchange code for tokens
    await authClient.idx.handleInteractionCodeRedirect(url);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    if (authClient.isInteractionRequiredError(err) === true) {
      const error = new Error(
        'Multifactor Authentication and Social Identity Providers is not currently supported, Authentication failed.'
      );
      next(error);
      return;
    }

    next(err);
  }
});

module.exports = router;
