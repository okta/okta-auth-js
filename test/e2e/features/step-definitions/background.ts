import { Given } from '@wdio/cucumber-framework';
import ActionContext from '../../../../samples/test/support/context';
import createGroup from '../../../../samples/test/support/management-api/createGroup';
import createApp from '../../../../samples/test/support/management-api/createApp';
import addAppToGroup from '../../../../samples/test/support/management-api/addAppToGroup';
import A18nClient from '../../../../samples/test/support/management-api/a18nClient';
import createPolicy from '../../../../samples/test/support/management-api/createPolicy';
import addAppToPolicy from '../../../../samples/test/support/management-api/addAppToPolicy';
import upsertPolicyRule from '../../../../samples/test/support/management-api/upsertPolicyRule';
import createCredentials from '../../../../samples/test/support/management-api/createCredentials';
import createUser from '../../../../samples/test/support/management-api/createUser';
import enrollFactor from '../../../../samples/test/support/management-api/enrollFactor';


// Extend the hook timeout to fight against org rate limit
const timeout = 3 * 60 * 10000;

Given(
  'an App that assigned to a test group',
  { timeout },
  async function(this: ActionContext) {
    const appType = 'browser';

    this.group = await createGroup(this.config);
    this.app = await createApp(this.config, { appType });
    const { credentials } = this.app;
    const clientId = credentials?.['oauthClient']?.['client_id'];
    if (!clientId) {
      throw new Error(`Missing clientId in newly created app ${this.app.id}`);
    }
    await addAppToGroup(this.config, { 
      appId: this.app.id, 
      groupId: this.group.id 
    });

    // attach a18n client to test context
    this.a18nClient = new A18nClient({ a18nAPIKey: this.config.a18nAPIKey });

    this.config.clientId = clientId;
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

Given('a user named {string}', async function(this: ActionContext, firstName: string) {
  this.credentials = await createCredentials(this.a18nClient, firstName, this.featureName);
});

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
  'she has enrolled in the {string} factor',
  { timeout },
  async function(this: ActionContext, factorType: string) {
    this.enrolledFactor = await enrollFactor(this.config, {
      userId: this.user.id,
      factorType,
      phoneNumber: this.credentials.phoneNumber,
    });
    this.sharedSecret = this.enrolledFactor._embedded?.activation?.sharedSecret;
  }
);
