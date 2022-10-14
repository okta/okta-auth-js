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

import * as nJwt from 'njwt';
import Rasha from 'rasha';

const DEFAULT_ALG = 'RS256';

function getPemAndJwk(privateKey) {
  let jwk;
  let pem;

  // Accept JWK as an object
  if (typeof privateKey === 'object') {
    jwk = privateKey;
  } else {
    // privateKey is a string, it may be in JWK or PEM format
    try {
      jwk = JSON.parse(privateKey);
    } catch (e) {
      // If JSON parsing fails, assume it is a PEM key
      pem = privateKey;
    }
  }

  if (jwk) {
    return Rasha.export({ jwk }).then(function (pem) {
      // PEM in PKCS1 (traditional) format
      return { pem, jwk };
    });
  } else {
    return Rasha.import({ pem }).then(function (jwk) {
      jwk.alg = jwk.alg || DEFAULT_ALG;
      return { pem, jwk };
    });
  }
}

export function makeJwt(options) {
  const { clientId, aud, privateKey } = options;

  const now = Math.floor(new Date().getTime() / 1000); // seconds since epoch
  const plus5Minutes = new Date((now + (5 * 60)) * 1000); // Date object

  const claims = { aud };
  return getPemAndJwk(privateKey)
    .then(res => {
      const { pem, jwk } = res;
      const alg = jwk.alg || DEFAULT_ALG;
      let jwt = nJwt.create(claims, pem, alg)
        .setIssuedAt(now)
        .setExpiration(plus5Minutes)
        .setIssuer(clientId)
        .setSubject(clientId);
      if (jwk.kid) {
        jwt = jwt.setHeader('kid', jwk.kid);
      }
      // JWT object is returned. It needs to be compacted with jwt.compact() before it can be used
      return jwt;
    });
}
