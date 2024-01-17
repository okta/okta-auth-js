import { Before } from '@wdio/cucumber-framework';
import ActionContext from '../../../../samples/test/support/context';

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
