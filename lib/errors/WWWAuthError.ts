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


import type { HttpResponse } from '../http';
import CustomError from './CustomError';
import { isFunction } from '../util';

// Error thrown after an unsuccessful network request which requires an Authorization header 
// and returns a 4XX error with a www-authenticate header. The header value is parsed to construct 
// an error instance, which contains key/value pairs parsed out
export default class WWWAuthError extends CustomError {
  static UNKNOWN_ERROR = 'UNKNOWN_WWW_AUTH_ERROR';

  scheme: string;
  parameters: Record<string, string>;
  name = 'WWWAuthError';

  resp: HttpResponse | null = null;

  constructor(scheme: string, parameters: Record<string, string>, resp?: HttpResponse) {
    // defaults to unknown error. `error` being returned in the www-authenticate header is expected
    // but cannot be guaranteed. Throwing an error within a error constructor seems awkward
    super(parameters.error ?? WWWAuthError.UNKNOWN_ERROR);
    this.scheme = scheme;
    this.parameters = parameters;

    if (resp) {
      this.resp = resp;
    }
  }

  // convenience references
  get error (): string { return this.parameters.error; }
  get errorCode (): string { return this.error; }                 // parity with other error props
  // eslint-disable-next-line camelcase
  get error_description (): string { return this.parameters.error_description; }
  // eslint-disable-next-line camelcase
  get errorDescription (): string { return this.error_description; }
  get errorSummary (): string { return this.errorDescription; }   // parity with other error props
  get realm (): string { return this.parameters.realm; }

  // parses the www-authenticate header for releveant
  static parseHeader (header: string): WWWAuthError | null {
    // header cannot be empty string
    if (!header) {
      return null;
    }

    // example string: Bearer error="invalid_token", error_description="The access token is invalid"
    // regex will match on `error="invalid_token", error_description="The access token is invalid"`
    // see unit test for more examples of possible www-authenticate values
    // eslint-disable-next-line max-len
    const regex = /(?:,|, )?([a-zA-Z0-9!#$%&'*+\-.^_`|~]+)=(?:"([a-zA-Z0-9!#$%&'*+\-.,^_`|~ /:]+)"|([a-zA-Z0-9!#$%&'*+\-.^_`|~/:]+))/g;
    const firstSpace = header.indexOf(' ');
    const scheme = header.slice(0, firstSpace);
    const remaining = header.slice(firstSpace + 1);
    const params = {};

    // Reference: foo="hello", bar="bye"
    // i=0, match=[foo="hello1", foo, hello]
    // i=1, match=[bar="bye", bar, bye]
    let match;
    while ((match = regex.exec(remaining)) !== null) {
      params[match[1]] = (match[2] ?? match[3]);
    }

    return new WWWAuthError(scheme, params);
  }

  // finds the value of the `www-authenticate` header. HeadersInit allows for a few different
  // representations of headers with different access patterns (.get vs [key])
  static getWWWAuthenticateHeader (headers: HeadersInit = {}): string | null {
    if (isFunction((headers as Headers)?.get)) {
      return (headers as Headers).get('WWW-Authenticate');
    }
    return headers['www-authenticate'] ?? headers['WWW-Authenticate'];
  }
}
