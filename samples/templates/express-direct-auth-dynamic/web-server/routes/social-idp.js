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


const express = require('express');
const {
  renderTemplate,
  renderEntryPage,
} = require('../utils');

const router = express.Router();

const proceed = ({ nextStep, req, res }) => {
  renderTemplate(req, res, 'login-with-idp', nextStep);
  return true;
};

router.get('/social-idp', renderEntryPage);

router.get('/login/callback', async (req, res) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const authClient = getAuthClient(req);
  try {
    // Exchange code for tokens
    await authClient.idx.handleInteractionCodeRedirect(url);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    if (authClient.isInteractionRequiredError(err) === true) {
      const { state } = req.query;
      res.redirect('/login/with-widget?state=' + state);
      return;
    }

    // TODO: show error message in home page
    req.setLastError(err);
    res.redirect('/');
  }
});

module.exports = router;
