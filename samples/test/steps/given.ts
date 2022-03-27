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

import { Given } from '@cucumber/cucumber';
import ActionContext from '../support/context';
import noop from '../support/action/noop';
import createPolicy from '../support/management-api/createPolicy';
import upsertPolicyRule from '../support/management-api/upsertPolicyRule';
import addAppToPolicy from '../support/management-api/addAppToPolicy';
import createUser from '../support/management-api/createUser';
import addAppToGroup from '../support/management-api/addAppToGroup';
import createCredentials, { UserCredentials } from '../support/management-api/createCredentials';
import enrollFactor from '../support/management-api/enrollFactor';
import grantConsentToScope from '../support/management-api/grantConsentToScope';
import updateAppOAuthClient from '../support/management-api/updateAppOAuthClient';
import clickButton from '../support/action/clickButton';
import checkIsOnPage from '../support/check/checkIsOnPage';
import loginDirect from '../support/action/loginDirect';
import addUserProfileSchemaToApp from '../support/management-api/addUserProfileSchemaToApp';
import openRegisterWithActivationToken from '../support/action/openRegisterWithActivationToken';
import fetchUser from '../support/management-api/fetchUser';

// NOTE: noop function is used for predefined settings

Given(
  'the app is assigned to {string} group', 
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext, groupName: string) {
    if (!this.app) {
      throw new Error('Application should be predefined');
    }
    await addAppToGroup({ appId: this.app.id, groupName });
  }
);

Given(
  'the app is granted {string} scope',
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext, scopeId: string) {
    await grantConsentToScope(this.app.id, scopeId);
  }
);

Given(
  'the app has a custom User Profile Schema named {string}',
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext, schemaName: string) {
    await addUserProfileSchemaToApp(this.app.id, schemaName);
  }
);

Given(
  'the app has Email Verification callback uri defined',
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext) {
    // Update app settings via internal API, public API should be used once available
    await updateAppOAuthClient(this.app, { 
      // eslint-disable-next-line @typescript-eslint/camelcase
      email_magic_link_redirect_uri: 'http://localhost:8080/login/callback'
    });
  }
);

Given(
  'a Policy that defines {string}',
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext, policyDescription: string) {
    this.policies = this.policies || [];
    const policy = await createPolicy({ 
      policyDescription, 
      groupId: this.group?.id
    });
    this.policies.push(policy);
    try {
      await addAppToPolicy(policy.id, this.app.id);
    } catch(err) {/* do nothing */}
  }
);

Given(
  'with a Policy Rule that defines {string}',
  {  wrapperOptions: { retry: 1 } },
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

Given('she has a second credential', async function(this: ActionContext) {
  this.secondCredentials = await createCredentials('MaryNew', this.featureName);
});

Given(
  'she has an account with {string} state in the org',
  {  wrapperOptions: { retry: 1 } },
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
      appId: (this.app?.id || process.env.CLIENT_ID) as string,
      credentials: this.credentials,
      activate,
      ...(this.group && {
        assignToGroups: [this.group.id]
      })
    });
  }
);

Given(
  'she has an account with active state in the org and her {string} is {string}',
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext, attrName: string, attrValue: string) {
    this.user = await createUser({
      // use predefined app when features are not available via management api
      appId: (this.app?.id || process.env.CLIENT_ID) as string,
      credentials: this.credentials,
      activate: true,
      ...(this.group && {
        assignToGroups: [this.group.id]
      }),
      customAttributes: {
        [attrName]: attrValue
      }
    });
  }
);

Given(
  'a predefined user named Mary with an account in the org', 
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext) {
    this.credentials = {
      emailAddress: process.env.USERNAME,
      email: process.env.USERNAME,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    } as unknown as UserCredentials;
    this.user = await fetchUser(this.credentials.emailAddress);
    (this.user as any).predefined = true;
  }
);

Given(
  'she is on the Root View in an AUTHENTICATED state', 
  async function(this: ActionContext) {
    await clickButton('login');
    await checkIsOnPage('Root');
    await loginDirect({
      username: this.credentials.emailAddress,
      password: this.credentials.password
    });
  }
);

Given(
  'she has enrolled in the {string} factor',
  {  wrapperOptions: { retry: 1 } },
  async function(this: ActionContext, factorType: string) {
    this.enrolledFactor = await enrollFactor({
      userId: this.user.id,
      factorType,
      phoneNumber: this.credentials.phoneNumber
    });
    this.sharedSecret = this.enrolledFactor._embedded?.activation?.sharedSecret;
  }
);

Given(
  'Mary opens the Self Service Registration View with activation token',
  async function(this: ActionContext) {
    await openRegisterWithActivationToken(this.user);
  }
);

Given('she does not have account in the org', noop);

Given('she is on the Root View in an UNAUTHENTICATED state', noop);

Given('she is not enrolled in any authenticators', noop);