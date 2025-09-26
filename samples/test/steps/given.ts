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
import crypto from 'crypto';
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
import clickLink from '../support/action/clickLink';
import checkIsOnPage from '../support/check/checkIsOnPage';
import checkFormMessage from '../support/check/checkFormMessage';
import loginDirect from '../support/action/loginDirect';
import addUserProfileSchemaToApp from '../support/management-api/addUserProfileSchemaToApp';
import openRegisterWithActivationToken from '../support/action/openRegisterWithActivationToken';
import fetchUser from '../support/management-api/fetchUser';
import A18nClient from '../support/management-api/a18nClient';
import createGroup from '../support/management-api/createGroup';
import createApp from '../support/management-api/createApp';
import startApp from '../support/action/startApp';
import { getConfig, toQueryString } from '../util';

// NOTE: noop function is used for predefined settings

// Extend the hook timeout to fight against org rate limit
const timeout = 3 * 60 * 10000;

Given(
  'a org with Global Session Policy that defines the Primary factor as {string}',
  { timeout },
  async function(this: ActionContext, policyDescription: string) {
    let issuer, oktaAPIKey;
    if (policyDescription === 'Password / IDP / any factor allowed by app sign on rules') {
      issuer = process.env.ISSUER_IDFIRST;
      oktaAPIKey = process.env.OKTA_API_KEY_IDFIRST;
    }

    this.config = {
      ...this.config,
      ...(issuer && { issuer }),
      ...(oktaAPIKey && { oktaAPIKey }),
    };
  }
);

Given(
  'an App that assigned to a test group',
  { timeout },
  async function(this: ActionContext) {
    const { issuer } = this.config;
    const { sampleConfig: { appType } } = getConfig();

    this.group = await createGroup(this.config);
    this.app = await createApp(this.config, { appType });
    const { 
      credentials: {
        // @ts-expect-error
        oauthClient: {
          client_id: clientId,
          client_secret: clientSecret
        }
      }
    } = this.app;
    await addAppToGroup(this.config, { 
      appId: this.app.id, 
      groupId: this.group.id 
    });

    // attach a18n client to test context
    this.a18nClient = new A18nClient({ a18nAPIKey: this.config.a18nAPIKey });
  
    // update test app with new oauthClient info
    await startApp('/', {
      ...(issuer && { issuer }),
      ...(clientId && { clientId }),
      ...(clientSecret && { clientSecret }),
      // attach org config to web app transaction
      ...(appType === 'web' && {
        transactionId: crypto.randomBytes(16).toString('hex')
      })
    });
  }
);

Given(
  'the app is assigned to {string} group', 
  { timeout },
  async function(this: ActionContext, groupName: string) {
    if (!this.app) {
      throw new Error('Application should be predefined');
    }
    await addAppToGroup(this.config, { appId: this.app.id, groupName });
  }
);

Given(
  'the app is granted {string} scope',
  { timeout },
  async function(this: ActionContext, scopeId: string) {
    await grantConsentToScope(this.config, {
      appId: this.app.id, 
      scopeId
    });
  }
);

Given(
  'the app has a custom User Profile Schema named {string}',
  { timeout },
  async function(this: ActionContext, schemaName: string) {
    await addUserProfileSchemaToApp(this.config, { 
      appId: this.app.id, 
      schemaName
    });
  }
);

Given(
  'the app has Email Verification callback uri defined',
  { timeout },
  async function(this: ActionContext) {
    // Update app settings via internal API, public API should be used once available
    await updateAppOAuthClient(this.config, { 
      app: this.app,
      settings: {
        // eslint-disable-next-line camelcase
        email_magic_link_redirect_uri: 'http://localhost:8080/login/callback'  
      }
    });
  }
);

Given(
  'a Policy that defines {string} with properties',
  { timeout },
  async function(this: ActionContext, policyDescription: string, dataTable) {
    this.policies = this.policies || [];
    const policy = await createPolicy(this.config, { 
      policyDescription,
      groupId: this.group?.id,
      dataTable
    });
    this.policies.push(policy);
    try {
      await addAppToPolicy(this.config, {
        policyId: policy.id, 
        appId: this.app.id 
      });
    } catch(err) {/* do nothing */}
  }
);

Given(
  'a Policy that defines {string}',
  { timeout },
  async function(this: ActionContext, policyDescription: string) {
    this.policies = this.policies || [];
    const policy = await createPolicy(this.config, { 
      policyDescription,
      groupId: this.group?.id
    });
    this.policies.push(policy);
    try {
      await addAppToPolicy(this.config, { 
        policyId: policy.id, 
        appId: this.app.id
      });
    } catch(err) {/* do nothing */}
  }
);

Given(
  'a Password Policy is set to Lock out user after {int} unsuccessful attempt',
  { timeout },
  async function(this: ActionContext, maxAttempts: number) {
    this.policies = this.policies || [];
    const policy = await createPolicy(this.config, { 
      policyDescription: 'Password',
      groupId: this.group?.id,
      maxAttempts
    });
    this.policies.push(policy);
    try {
      await addAppToPolicy(this.config, { 
        policyId: policy.id, 
        appId: this.app.id
      });
    } catch(err) {/* do nothing */}
  }
);

Given(
  /^the Password Policy Rule (?<policyRuleDescription>.+?)$/,
  { timeout },
  async function(this: ActionContext, policyRuleDescription: string) {
    const lastPolicy = this.policies[this.policies.length - 1];
    await upsertPolicyRule(this.config, { 
      policyId: lastPolicy.id, 
      policyType: lastPolicy.type,
      policyRuleDescription,
      groupId: this.group?.id
    });
  }
);

Given(
  'with a Policy Rule that defines {string}',
  { timeout },
  async function(this: ActionContext, policyRuleDescription: string) {
    const lastPolicy = this.policies[this.policies.length - 1];
    await upsertPolicyRule(this.config, { 
      policyId: lastPolicy.id, 
      policyType: lastPolicy.type,
      policyRuleDescription,
      groupId: this.group?.id
    });
  }
);

Given(
  'she has an account with {string} state in the org',
  { timeout },
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
    this.user = await createUser(this.config, {
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
  { timeout },
  async function(this: ActionContext, attrName: string, attrValue: string) {
    this.user = await createUser(this.config, {
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
  { timeout },
  async function(this: ActionContext) {
    this.credentials = {
      emailAddress: process.env.USERNAME,
      email: process.env.USERNAME,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    } as unknown as UserCredentials;
    this.user = await fetchUser(this.config, { 
      username: this.credentials.emailAddress 
    });
    (this.user as any).predefined = true;
  }
);

Given(
  'she has enrolled in the {string} factor',
  { timeout },
  async function(this: ActionContext, factorType: string) {
    this.enrolledFactor = await enrollFactor(this.config, {
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

Given('a user named {string}', async function(this: ActionContext, firstName: string) {
  this.credentials = await createCredentials(this.a18nClient, firstName, this.featureName);
});

Given('she has a second credential', async function(this: ActionContext) {
  this.secondCredentials = await createCredentials(this.a18nClient, 'MaryNew', this.featureName);
});

Given(
  'she is on the Root View in an AUTHENTICATED state', 
  async function(this: ActionContext) {
    await clickButton('login');
    await checkIsOnPage('Identify');
    await loginDirect({
      username: this.credentials.emailAddress,
      password: this.credentials.password
    });
  }
);

Given(
  'she is on the Root View in an AUTHENTICATED state with ACR value {string}', 
  async function(this: ActionContext, acrValues: string) {
    await clickButton('login');
    await browser.url(await browser.getUrl() + toQueryString({
      acrValues,
    }));
    await checkIsOnPage('Identify');
    await loginDirect({
      username: this.credentials.emailAddress,
      password: this.credentials.password
    });
  }
);

Given('she does not have account in the org', noop);

Given('she is on the Root View in an UNAUTHENTICATED state', noop);

Given('she is not enrolled in any authenticators', noop);

Given(
  'Mary has entered an incorrect password to trigger an account lockout', 
  async function(this: ActionContext) {
    await clickButton('login');
    await checkIsOnPage('Login');
    await loginDirect({
      username: this.credentials.emailAddress,
      password: '!incorrect!'
    });
    await checkFormMessage('Authentication failed');
    await clickLink('Home');
  }
);