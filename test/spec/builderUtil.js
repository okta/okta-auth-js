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


const builderUtil  = require('../../lib/builderUtil');

describe('builderUtil', () => {

  describe('getUserAgent', () => {
    it('should return userAgent if "userAgent.value" is provided in args', () => {
      const args = { 
        userAgent: {
          value: 'fake userAgent'
        }
      };
      const userAgent = builderUtil.getUserAgent(args);
      expect(userAgent).toEqual('fake userAgent');
    });
    it('replaces "$OKTA_AUTH_JS" with current authJs user agent if userAgentTemplate in args', () => {
      const args = { 
        userAgent: {
          template: 'fake userAgent $OKTA_AUTH_JS' 
        } 
      };
      const sdkUserAgentValue = 'okta-auth-js/0.0.0';
      const userAgent = builderUtil.getUserAgent(args, sdkUserAgentValue);
      expect(userAgent).toEqual(`fake userAgent okta-auth-js/0.0.0`);
    });
    it('should return undefined if no userAgent object is in args', () => {
      const args = {};
      const userAgent = builderUtil.getUserAgent(args);
      expect(userAgent).toEqual(undefined);
    });
    it('should return undefined if neither with userAgent.value nor userAgent.template in args', () => {
      const args = {
        userAgent: {}
      };
      const userAgent = builderUtil.getUserAgent(args);
      expect(userAgent).toEqual(undefined);
    });
    it('should return sdk defined user agent if no userAgent object is in args', () => {
      const args = {};
      const sdkUserAgentValue = 'okta-auth-js-fake/0.0.0';
      const userAgent = builderUtil.getUserAgent(args, sdkUserAgentValue);
      expect(userAgent).toEqual('okta-auth-js-fake/0.0.0');
    });
    it('should return sdk defined user agent if neither with userAgent.value nor userAgent.template in args', () => {
      const args = {
        userAgent: {}
      };
      const sdkUserAgentValue = 'okta-auth-js-fake/0.0.0';
      const userAgent = builderUtil.getUserAgent(args, sdkUserAgentValue);
      expect(userAgent).toEqual('okta-auth-js-fake/0.0.0');
    });
  });

});
