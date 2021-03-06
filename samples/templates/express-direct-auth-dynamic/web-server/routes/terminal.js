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
const { renderTemplate, getAuthClient } = require('../utils');

const router = express.Router();

router.get('/terminal', (req, res) => {
  const idxStates = req.getIdxStates();
  req.clearIdxStates();

  const messages = idxStates.messages.reduce((acc, curr) => {
    acc.push(curr.message);
    return acc;
  }, []);

  // Clear transaction meta at app layer when reach to terminal state
  const authClient = getAuthClient(req);
  authClient.transactionManager.clear();

  // Render
  renderTemplate(req, res, 'terminal', {
    messages
  });
});

module.exports = router;
