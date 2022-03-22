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

/* eslint-disable max-len */

import { Given } from '@cucumber/cucumber';
import setEnvironment from '../support/action/setEnvironment';
import navigateTo from '../support/action/navigateTo';
import navigateToLoginAndAuthenticate from '../support/action/context-enabled/live-user/navigateToLoginAndAuthenticate';
import ActionContext from '../support/context';
import attachPolicy from '../support/action/context-enabled/org-config/attachPolicy';
import activateContextUserActivationToken from '../support/action/context-enabled/live-user/activateContextUserActivationToken';
import Home from '../support/selectors/Home';
import startApp from '../support/action/startApp';
import noop from '../support/action/noop';
import createApp from '../support/management-api/createApp';
import createPolicy from '../support/management-api/createPolicy';
import upsertPolicyRule from '../support/management-api/upsertPolicyRule';
import addAppToPolicy from '../support/management-api/addAppToPolicy';
import createUser from '../support/management-api/createUser';
import createGroup from '../support/management-api/createGroup';
import addAppToGroup from '../support/management-api/addAppToGroup';
import addUserToGroup from '../support/management-api/addUserToGroup';
import createCredentials from '../support/management-api/createCredentials';
import enrollFactor from '../support/management-api/enrollFactor';

// NOTE: noop function is used for predefined settings

Given('a Group', async function(this: ActionContext) {
  this.group = await createGroup();
});

Given('an App', async function(this: ActionContext) {
  this.app = await createApp();
  const { 
    credentials: {
      oauthClient: {
        client_id: clientId,
        client_secret: clientSecret
      }
    } 
  } = this.app;

  if (this.group) {
    await addAppToGroup({ appId: this.app.id, groupId: this.group.id });
  }

  // update test app with new oauthClient info
  startApp('/', {
    ...(clientId && { clientId }),
    ...(clientSecret && { clientSecret }),
  });
});

Given('a predefined App that defines {string}', setEnvironment);

Given(
  'the app is assigned to {string} group', 
  async function(this: ActionContext, groupName: string) {
    if (!this.app) {
      throw new Error('Application should be predefined');
    }
    await addAppToGroup({ appId: this.app.id, groupName });
  }
);

Given(
  'the app is assigned to the created group',
  async function(this: ActionContext) {
    if (!this.group) {
      throw new Error('Group should be predefined');
    }
    await addAppToGroup({ appId: this.app.id, groupId: this.group.id });
  }
);

Given(
  'a Policy that defines {string}',
  async function(this: ActionContext, policyDescription: string) {
    this.policies = this.policies || [];
    const policy = await createPolicy({ 
      policyDescription, 
      groupId: this.group?.id
    });
    this.policies.push(policy);
    try {
      await addAppToPolicy(policy.id, this.app.id);
    } catch(err) {
      console.info('Not all policies can map to an app, ignore the error.', err)
    }
  }
);

Given(
  'with a Policy Rule that defines {string}',
  async function(this: ActionContext, policyRuleDescription: string) {
    const lastPolicy = this.policies[this.policies.length - 1];
    await upsertPolicyRule({ 
      policyId: lastPolicy.id, 
      policyType: lastPolicy.type,
      policyRuleDescription,
      groupId: this.group?.id
    });
  }
);

Given('a user named {string}', async function(this: ActionContext, firstName: string) {
  this.credentials = await createCredentials(firstName, this.featureName);
});

Given(
  'she has an account with {string} state in the org',
  async function(this: ActionContext, accountState: string) {
    if (!this.credentials) {
      throw new Error('Context credentials has not been created!');
    }
    const activate = (() => {
      switch (accountState) {
        case 'active':
          return true;
        default:
          return false;
      }
    })();
    this.user = await createUser({
      // use predefined app when features are not available via management api
      appId: this.app?.id || process.env.CLIENT_ID,
      credentials: this.credentials,
      activate
    });
  }
);

Given(
  'she is assigned to the created group', 
  async function(this: ActionContext) {
    if (!this.group) {
      throw new Error('Group has not been created');
    }
    if (!this.user) {
      throw new Error('User has not been created');
    }
    await addUserToGroup({ 
      userId: this.user.id, 
      groupId: this.group.id
    });
  }
);

Given('she does not have account in the org', noop);

Given(
  'she has an authenticated session',
  navigateToLoginAndAuthenticate
);

Given(
  'she has enrolled in the {string} factor',
  async function(this: ActionContext, factorType: string) {
    this.enrolledFactor = await enrollFactor({
      userId: this.user.id,
      factorType
    });
    this.sharedSecret = this.enrolledFactor._embedded?.activation?.sharedSecret;
  }
);

Given(
  'a property named {string} is allowed and assigned to a SPA, WEB APP or MOBILE application',
  async function(this: ActionContext, propertyName: string) {
    const PROPERTY_POLICY_MAP = {
      customAttribute: 'Custom Attribute Policy',
      age: 'Age Attribute Policy'
    };
    await attachPolicy.call(this, (PROPERTY_POLICY_MAP as any)[propertyName]);
    this.customAttribute = propertyName;
  }
);

Given(
  /^an APP Sign On Policy (.*)$/,
  setEnvironment
);

Given(
  /^an org with (.*)$/,
  setEnvironment
);

Given(
  /^a SPA, WEB APP or MOBILE Policy (.*)$/,
  setEnvironment
);

Given(
  /^the Application Sign on Policy is set to "(.*)"$/,
  setEnvironment
);

Given(
  /^([^/s]+) navigates to (?:the )?(.*)$/,
  async function(this: ActionContext, firstName, pageName) {
    await navigateTo(pageName);
  }
);

Given(
  'Mary has an authenticated session',
  navigateToLoginAndAuthenticate
);

Given(
  /^Mary opens the Self Service Registration View with activation token/,
  activateContextUserActivationToken
);

Given(
  /^an Authenticator Enrollment Policy that has PHONE as optional and EMAIL as required for the Everyone Group$/,
  noop
);

Given(
  /^she is not enrolled in any authenticators$/,
  noop
);

Given(
  'Mary is on the Root View in an UNAUTHENTICATED state',
  async () => await startApp(Home.path)
);
