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


const handleAuthorizationCode = require('./authorizationCodeFlow');
const handleInteractionCode = require('./interactionCodeFlow');

function getTokens(req, res, next) {
  const interactionCode = req.query.interaction_code;
  if (interactionCode) {
    return handleInteractionCode(req, res, next);
  }

  const authorizationCode = req.query.code;
  if (authorizationCode) {
    return handleAuthorizationCode(req, res, next);
  }

  // We don't understand the URL, or there are no query parameters
  return Promise.resolve({});
}

function responseHtml(req, result, error, errorDescription) {
  let bodyHtml;
  if (error) {
    bodyHtml = `
      <h1>${error}</h1>
      <p>
      ${errorDescription}
      </p>
    `;
  } else {
    bodyHtml = `
      <code id="oidcResult">${result}</code>
    `;
  }

  return `
    <html>
      <body>
        ${bodyHtml}
      </body>
    </html>
  `;
}

module.exports = function callbackMiddleware(req, res, next) {
  // OAuth errors may be returned as a query parameter
  const error = req.query.error;
  if (error) {
    res.send(responseHtml(req, null, error, req.query.error_description));
    return;
  }

  let result = '';
  getTokens(req, res, next)
  .then(tokens => {
    result = JSON.stringify(tokens, null, 2);
  })
  .catch(err => {
    result = 'Error: ' + err.toString();
  })
  .finally(() => {
    res.send(responseHtml(req, result));
  });
};
