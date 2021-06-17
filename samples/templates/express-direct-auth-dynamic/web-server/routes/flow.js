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
  redirect,
  getRedirectFlow,
} = require('../utils');


const express = require('express');

const router = express.Router();

router.get('/flow', async (req, res) => {
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.startTransaction();
  req.setIdxStates(transaction);

  const { flow: entryFlow } = req.query;
  const redirectFlow = getRedirectFlow(entryFlow, transaction);
  req.setFlows({ entry: entryFlow, redirect: redirectFlow });

  redirect({ req, res, path: `/${redirectFlow ? redirectFlow : entryFlow}` });
});

module.exports = router;
