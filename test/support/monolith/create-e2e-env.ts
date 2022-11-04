// eslint-disable-next-line no-undef, node/no-missing-import, node/no-extraneous-import
import * as dockolith from '@okta/dockolith';
import { writeFileSync } from 'fs';
import * as path from 'path';

// Bootstraps a local monolith instance
/* eslint max-statements: [2, 60], complexity: [2, 10] */
async function bootstrap() {
  const subDomain = process.env.TEST_ORG_SUBDOMAIN || 'authjs-test-' + Date.now();
  const outputFilePath = path.join(__dirname, '../../../', 'testenv.local');

  console.error(`Bootstrap starting: ${subDomain}`);

  const config = await dockolith.createTestOrg({
    subDomain,
    edition: 'Test',
    userCount: 3,
    activateUsers: true,
    skipFirstTimeLogin: true,
    testName: subDomain
  });

  console.error('Org: ', config.orgUrl);
  console.error('Token: ', config.token);

  const oktaClient = dockolith.getClient(config);
  const { id: orgId } = await oktaClient.getOrgSettings();

  await dockolith.enableOIE(orgId);
  await dockolith.activateOrgFactor(config, 'okta_email');
  await dockolith.disableStepUpForPasswordRecovery(config);

  // Enable interaction_code grant on the default authorization server
  const authServer = await dockolith.getDefaultAuthorizationServer(config);
  await authServer.listPolicies().each(async (policy) => {
    if (policy.name === 'Default Policy') {
      await policy.listPolicyRules(authServer.id).each(async (rule) => {
        if (rule.name === 'Default Policy Rule') {
          rule.conditions.grantTypes = {
            include: [
              'implicit',
              'client_credentials',
              'password',
              'authorization_code',
              'interaction_code' // need to add interaction_code grant or user will see no_matching_policy error
            ]
          };
          await rule.update(policy.id, authServer.id);
        }
      });
    }
  });

  const spaPolicy = await oktaClient.createPolicy({
    name: 'Widget SPA Policy',
    type: 'ACCESS_POLICY',
    status : 'ACTIVE'
  });

  // Modify catch-all rule to enforce password only
  const catchAll = await dockolith.getCatchAllRule(config, spaPolicy.id);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  catchAll.actions.appSignOn = {
    access: 'ALLOW',
    verificationMethod: {
        factorMode: '1FA',
        type: 'ASSURANCE',
        reauthenticateIn: 'PT12H',
        constraints: [{
          knowledge: {
            types: [
              'password'
            ]
          }
        }]
    }
  };
  catchAll.update(spaPolicy.id);

  const options = {
    enableFFs: [
      'API_ACCESS_MANAGEMENT',
      'ENG_ENABLE_SSU_FOR_OIE',
    ],
    disableFFs: [
      'REQUIRE_PKCE_FOR_OIDC_APPS'
    ],
    users: [
      {
        firstName: 'Saml',
        lastName: 'Jackson',
        email: 'george@acme.com',
        password: 'Abcd1234'
      },
      {
        firstName: 'Alexander',
        lastName: 'Hamilton',
        email: 'mary@acme.com',
        password: 'Abcd1234'
      }
    ],
    apps: [
      {
        label: 'AUTHJS WEB APP',
        appType: 'web',
        interactionCode: true
      },
      {
        label: 'AUTHJS SPA APP',
        appType: 'browser',
        interactionCode: true,
        refreshToken: true
      }
    ],
    origins: [
      {
        name: 'AuthJS Test App',
        origin: 'http://localhost:8080',
      }
    ]
  };

  // Set Feature flags
  console.error('Setting feature flags...');
  for (const option of options.enableFFs) {
    await dockolith.enableFeatureFlag(config, orgId, option);
  }
  for (const option of options.disableFFs) {
    await dockolith.disableFeatureFlag(config, orgId, option);
  }

  // Add Trusted origins
  for (const option of options.origins) {
    await oktaClient.listOrigins().each(async (origin) => {
      console.error('Existing origin: ', origin);
      if (origin.origin === option.origin) {
        console.error(`Removing existing origin ${option.name}`);
        await origin.delete();
      }
    });
    console.error(`Adding trusted origin "${option.name}": ${option.origin}`);
    await oktaClient.createOrigin({
      name: option.name,
      origin:  option.origin,
      scopes: [{
        type: 'CORS'
      }, {
        type: 'REDIRECT'
      }]
    });
  }

  // Delete apps if they already exist
  await oktaClient.listApplications().each(async (app) => {
    for (const option of options.apps) {
      if (app.label === option.label) {
        console.error(`Deleting existing application with label ${app.label}`);
        await app.deactivate();
        return app.delete();
      }
    }
  });

  // Create apps
  const createdApps: any[] = [];
  for (const option of options.apps) {
    console.error(`Creating app "${option.label}"`);
    const app = await dockolith.createApp(config, {
      clientUri: 'http://localhost:8080',
      redirectUris: [
        'http://localhost:8080/login/callback'
      ],
      ...option
    });
    createdApps.push(app);
  }
  const webApp = createdApps[0];
  const spaApp = createdApps[1];

  // Assign sign-on policy to SPA app
  dockolith.setPolicyForApp(config, spaApp.id, spaPolicy.id);

  // Delete users if they exist
  await oktaClient.listUsers().each(async (user) => {
    for (const option of options.users) {
      if (user.profile.login === option.email) {
        console.error(`Found existing user: ${option.email}`);
        await user.deactivate();
        await user.delete();
      }
    }
  });

  // Create users
  const createdUsers: any[] = [];
  for (const option of options.users) {
    console.error(`Creating user "${option.firstName} ${option.lastName}"`);
    const user = await dockolith.createUser(oktaClient, option);
    createdUsers.push(user);
  }
  const user1 = createdUsers[0];
  // const user2 = createdUsers[1];

  // User 1 assigned to apps
  for (const app of createdApps) {
    await oktaClient.assignUserToApplication(app.id, {
      id: user1.id
    });
  }
  // User 2 not assigned to app

  const output = {
    OKTA_CLIENT_TOKEN: config.token,
    TEST_ORG_ID: orgId,

    ISSUER: config.orgUrl,
    SPA_CLIENT_ID: spaApp.id,
    WEB_CLIENT_ID: webApp.id,
    CLIENT_ID: spaApp.id,
    
    ORG_OIE_ENABLED: true,
    REFRESH_TOKEN: true,
    LOCAL_MONOLITH: 1,

    USERNAME: user1.profile.login,
    PASSWORD: options.users[0].password,
  };

  console.error(`Writing output to: ${outputFilePath}`);

  // write output
  const iniOutput = Object.keys(output).reduce((str, key) => {
    const val = (output as any)[key];
    return str + `${key}="${val}"\n`;
  }, `\n# Local config: ${subDomain}\n`);
  writeFileSync(outputFilePath, iniOutput);
}

(async function() {
  try {
    await bootstrap();
  } catch (e) {
    console.error('Caught exception: ', e);
    throw e;
  }
})();