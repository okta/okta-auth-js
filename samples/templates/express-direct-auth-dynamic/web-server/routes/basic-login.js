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
