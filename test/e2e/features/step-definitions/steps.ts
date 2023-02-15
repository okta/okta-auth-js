import { Given, When, Then } from '@wdio/cucumber-framework';
import ActionContext from 'support/context';
import TestApp from '../../pageobjects/TestApp';
import OktaLogin from '../../pageobjects/OktaLogin';
import { openPKCE } from '../../util/appUtils';
import listFactors from 'management-api/listFactors';

const ORG_OIE_ENABLED = process.env.ORG_OIE_ENABLED;

interface DataTable {
  rawTable: string[][]
}

When(/^she logins with (\w+) and (.+)$/, async function (username, password) {
  await $('#username').setValue(username);
  await $('#password').setValue(password);
  await $('#login-direct').click();
});

Then(/^she should see an error message saying (.+)$/, 
  { timeout: 10*1000 }, 
  async function (_errorMessage) {
    await expect($('#error')).toBeExisting();
});

Given(
  'Mary is on the default view in an UNAUTHENTICATED state', 
  async function (this: ActionContext) {
    const { issuer, clientId } = this.config;
    await openPKCE({
      ...(issuer && { issuer }),
      ...(clientId && { clientId }),
      useInteractionCodeFlow: !!ORG_OIE_ENABLED,
    });

    await TestApp.assertLoggedOut();
});

When('she clicks the {string} button', async function (buttonName) {
  let el;
  switch (buttonName) {
    case 'Update Config':
      el = await TestApp.submit;
    break;
    case 'Login using REDIRECT':
      el = await TestApp.loginRedirectBtn;
    break;
    case 'Login with ACR':
      el = await TestApp.loginWithAcrBtn;
    break;
    case 'Enroll Authenticator':
      el = await TestApp.enrollAuthenticator;
    break;
    case 'Handle callback (Continue Login)':
      el = await TestApp.handleCallbackBtn;
    break;
    default:
      throw new Error(`Unknown button ${buttonName}`);
  }

  await el.click();  
});

Then(
  'the callback is handled',
  async function () {
    await TestApp.assertCallbackSuccess();
  }
);

Then(
  'the callback is not handled with error {string}',
  async function (expectedError: string) {
    await (await TestApp.error).waitForDisplayed({
      timeout: 3*1000,
    });

    const errText = await (await TestApp.error).getText();
    expect(errText).toBe(expectedError);
  }
);

Then(
  'the callback is handled with message {string}',
  async function (expectedMsg: string) {
    await (await TestApp.success).waitForDisplayed({
      timeout: 3*1000,
    });

    const successText = await (await TestApp.success).getText();
    expect(successText).toBe(expectedMsg);
  }
);

Then(
  'the app should construct an authorize request for the protected action, not including an ACR Token in the request or an ACR value',
  async function () {
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      const queryStr = url.split('?')[1];
      const params = new URLSearchParams(queryStr);
      return url.includes('/authorize') && !params.get('acr_values');
    });
  }
);

Then(
  'the app should construct an authorize request for the protected action, not including an ACR Token in the request but including the ACR value',
  async function () {
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      const queryStr = url.split('?')[1];
      const params = new URLSearchParams(queryStr);
      return url.includes('/authorize') && !!params.get('acr_values');
    });
  }
);

Then(
  'the app should construct an authorize request for the protected action, including an ACR Token in the request but including the ACR value',
  async function () {
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      const queryStr = url.split('?')[1];
      const params = new URLSearchParams(queryStr);
      return url.includes('/authorize') && !!params.get('acr_values');
    });
  }
);

Then(
  'the app should construct an authorize request for the protected action, not including an ACR Token in the request but including the bad ACR value',
  async function () {
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      const queryStr = url.split('?')[1];
      const params = new URLSearchParams(queryStr);
      return url.includes('/authorize') && params.get('acr_values') === 'bad-value';
    });
  }
);

Then(
  'the app should construct an authorize request with params',
  async function (dataTable: DataTable) {
    const expectedParams: Record<string, string> = dataTable?.rawTable.
      reduce((acc: any, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes('/authorize');
    });

    const url = await browser.getUrl();
    const queryStr = url.split('?')[1];
    const urlParams = new URLSearchParams(queryStr);
    const params = {};
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
  
    for (const [k, v] of Object.entries(expectedParams)) {
      expect(params[k]).toBe(v);
    }
  }
);

Then(
  'she should be redirected to the Okta Sign In Widget',
  async function () {
    await OktaLogin.waitForLoad();
  }
);

When(
  'she inputs her username and password in widget',
  async function (this: ActionContext) {
    await OktaLogin.signin(
      this.credentials.emailAddress,
      this.credentials.password
    );
  }
);

Then(
  /^she (?:is redirected to|sees) the default view in an AUTHENTICATED state$/,
  { timeout: 10*1000 }, 
  async function () {
    await TestApp.assertLoggedIn();
  }
);

Then(
  'she is redirected to the handle callback page',
  async function () {
    await TestApp.waitForCallback();
  }
);

When(
  'she returns home',
  async function () {
    await TestApp.returnHome();
  }
);

Then(
  /^she (?:is redirected to|sees) the default view in an UNAUTHENTICATED state$/,
  { timeout: 10*1000 }, 
  async function () {
    await TestApp.assertLoggedOut();
  }
);

Then(
  'she sees her ID and Access Tokens',
  async function () {
    await TestApp.assertLoggedIn();
  }
);

When(
  'she refreshes the page',
  async function () {
    await browser.refresh();
  }
);

When('she selects {string} into {string}', async function (value, field) {
  let f;
  switch (field) {
    case 'ACR values':
      f = await TestApp.acrValues;
    break;
    default:
      throw new Error(`Unknown field ${field}`);
  }
  await f.selectByAttribute('value', value);
});

Given('she enters {string} into {string}', async function (value, field) {
  let f;
  switch (field) {
    case 'Enroll AMR values':
      f = await TestApp.enrollAmrValues;  
    break;
    default:
      throw new Error(`Unknown field ${field}`);
  }
  await f.setValue(value);
});

When('she selects incorrect value in {string}', async function (field) {
  let f: string;
  switch (field) {
    case 'ACR values':
      f = 'acrValues';  
    break;
    default:
      throw new Error(`Unknown field ${field}`);
  }

  const url = await browser.getUrl();
  const [ baseUrl, queryStr ] = url.split('?');
  const params = new URLSearchParams(queryStr);
  params.set(f, 'bad-value');
  const newUrl = baseUrl + '?' + params.toString();
  await browser.url(newUrl);
});

Then('she sees {string} in {string}', async function (value, field) {
  let el;
  switch (field) {
    case 'Enroll AMR values':
      el = await TestApp.enrollAmrValues;  
    break;
    case 'ACR values':
      el = await TestApp.acrValues;  
    break;
    default:
      throw new Error(`Unknown field ${field}`);
  }

  const actualValue = await el.getValue();
  expect(actualValue).toBe(value);
});

Then(
  'she should be challenged to verify her {string}',
  { timeout: 10*1000 }, 
  async function (factor: 'email' | 'sms') {
    // There can be 2 options:
    // - page with title "Verify it's you with a security method" and authenticators list with only email availale to select
    // - page with title "Get a verification email" and button to submit verification request
    let isVerificationDisplayed, isListDisplayed;

    await browser.waitUntil(async () => {
      const header = await OktaLogin.signinFormTitle;
      const title = await header.getText();
      isVerificationDisplayed = title === OktaLogin.getFactorVerificationTitle(factor);
      const list = await OktaLogin.authenticatorsList;
      isListDisplayed = await list?.isDisplayed();
      return isVerificationDisplayed || isListDisplayed;
    }, {
      timeout: 10*1000
    });

    if (isVerificationDisplayed) {
      await OktaLogin.clickSendVerificationCode();
    } else if (isListDisplayed) {
      await OktaLogin.selectAuthenticator(factor);
    }
  }
);

When(
  'she verifies her sms',
  { timeout: 30*1000 }, 
  async function (this: ActionContext) {
    await OktaLogin.receiveCodeViaSms();
    const code = await this.a18nClient.getSMSCode(this.credentials.profileId);
    await OktaLogin.enterCode(code);
    await OktaLogin.clickVerify();
  }
);

When(
  'she verifies her email',
  { timeout: 30*1000 }, 
  async function (this: ActionContext) {
    await OktaLogin.verifyWithEmailCode();
    const code = await this.a18nClient.getEmailCode(this.credentials.profileId);
    await OktaLogin.enterCode(code);
    await OktaLogin.clickVerify();
  }
);

Then(
  'the app receives and additional token for this ACR value {string}',
  async function (acrValue: string) {
    const idToken = await TestApp.getIdToken();
    expect(idToken?.claims?.acr).toBe(acrValue);
  }
);

Then(
  'the app stores this new token in Token Storage',
  async function() {}
);

Then(
  'the Sign In Widget validates her token',
  async function() {}
);

Then(
  'she is required to set up authenticator "Security Question"',
  { timeout: 10*1000 }, 
  async function () {
    await browser.waitUntil(async () => {
      const list = await OktaLogin.authenticatorsList;
      const isListDisplayed = await list?.isDisplayed();
      return isListDisplayed;
    }, {
      timeout: 10*1000
    });

    await OktaLogin.selectSecurityQuestionAuthenticator();
  }
);

When(
  'she creates security question answer',
  { timeout: 20*1000 }, 
  async function (this: ActionContext) {
    const answer = 'okta';
    await OktaLogin.enterAnswer(answer);
    await OktaLogin.clickVerify();
  }
);

Given(
  'she is enrolled in the {string} factors',
  { timeout: 30*1000 },
  async function(this: ActionContext, factorTypesStr: string) {
    const enrolledFactorTypes = await listFactors(this.config, {
      userId: this.user.id
    });
    const factorTypes = factorTypesStr.split(',').map(f => f.trim());
    for (const f of factorTypes) {
      expect(enrolledFactorTypes).toContain(f);
    }
  }
);

Given(
  'she is not enrolled in the {string} factors',
  { timeout: 30*1000 },
  async function(this: ActionContext, factorTypesStr: string) {
    const enrolledFactorTypes = await listFactors(this.config, {
      userId: this.user.id
    });
    const factorTypes = factorTypesStr.split(',').map(f => f.trim());
    for (const f of factorTypes) {
      expect(enrolledFactorTypes).not.toContain(f);
    }
  }
);
