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



import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';

describe('assertValidConfig', () => {

  it('throw an error if no arguments are passed to the constructor', function () {
    var err;
    try {
      new OktaAuth(undefined as unknown as OktaAuthOptions); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('No issuer passed to constructor. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  });

  it('throw an error if no issuer is passed to the constructor', function () {
    var err;
    try {
      // @ts-expect-error this test is deliberately testing an error is throw if no issuer is passed
      new OktaAuth({}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('No issuer passed to constructor. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  });

  it('throw an error if issuer is not a url', function () {
    var err;
    try {
      new OktaAuth({issuer: 'default'}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('Issuer must be a valid URL. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  });

});