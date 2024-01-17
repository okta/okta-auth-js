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


import { Before } from '@cucumber/cucumber';
import ActionContext from '../support/context';

Before('@flaky', function () {
  if (process.env.SKIP_SAMPLE_FLAKY === 'true') {
    return 'skipped';
  }
});

Before('@smstest', function () {
  if (process.env.SKIP_SMS === 'true') {
    return 'skipped';
  }
});

Before(function (this: ActionContext, scenario: any) {
  this.featureName = scenario?.gherkinDocument?.feature?.name;
  this.scenarioName = scenario?.pickle?.name;
});

// Extend the hook timeout to fight against org rate limit
Before({ timeout: 3 * 60 * 10000 }, async function(this: ActionContext) {
  this.config = {
    a18nAPIKey: process.env.A18N_API_KEY,
    issuer: process.env.ISSUER,
    oktaAPIKey: process.env.OKTA_API_KEY
  };
});
