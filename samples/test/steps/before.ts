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
import crypto from 'crypto';
import ActionContext from '../support/context';
import createGroup from '../support/management-api/createGroup';
import createApp from '../support/management-api/createApp';
import addAppToGroup from '../support/management-api/addAppToGroup';
import startApp from '../support/action/startApp';
import { getConfig } from '../util/configUtils';

Before(function (this: ActionContext, scenario: any) {
  this.featureName = scenario?.gherkinDocument?.feature?.name;
  this.scenarioName = scenario?.pickle?.name;
});

// prepare app and group for all scenarios
Before(async function(this: ActionContext) {
  this.group = await createGroup();
  this.app = await createApp();
  const { 
    credentials: {
      oauthClient: {
        client_id: clientId,
        client_secret: clientSecret
      }
    }
  } = this.app;

  await addAppToGroup({ appId: this.app.id, groupId: this.group.id });

  // update test app with new oauthClient info
  const { sampleConfig: { appType } } = getConfig();
  await startApp('/', {
    ...(clientId && { clientId }),
    ...(clientSecret && { clientSecret }),
    // attach org config to web app transaction
    ...(appType === 'web' && {
      transactionId: crypto.randomBytes(16).toString('hex')
    })
  });
});
