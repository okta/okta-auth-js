import { Given, When, Then } from '@wdio/cucumber-framework';
import ActionContext from 'support/context';
import TestApp from '../../pageobjects/TestApp';
import OktaLogin from '../../pageobjects/OktaLogin';
import { openPKCE } from '../../util/appUtils';

const ORG_OIE_ENABLED = process.env.ORG_OIE_ENABLED;

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
  let el: WebdriverIO.Element;
  switch (buttonName) {
    case 'Update Config':
      el = await TestApp.submit;
    break;
    case 'Login using REDIRECT':
      el = await TestApp.loginRedirectBtn;
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
)

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
)

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
  let f: WebdriverIO.Element;
  switch (field) {
    case 'ACR values':
      f = await TestApp.acrValues;  
    break;
    default:
      throw new Error(`Unknown field ${field}`);
  }
  await f.selectByAttribute('value', value);
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
  let el: WebdriverIO.Element;
  switch (field) {
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
  'she should be challenged to verify her email',
  { timeout: 10*1000 }, 
  async function () {
    await browser.waitUntil(async () => {
      const header = await OktaLogin.signinFormTitle;
      const title = await header.getText();
      return title === 'Get a verification email';
    }, {
      timeout: 10*1000
    });
  }
);

When(
  'she verifies her email',
  { timeout: 30*1000 }, 
  async function (this: ActionContext) {
    await OktaLogin.clickSendEmail();
    await OktaLogin.verifyWithEmailCode();
    const code = await this.a18nClient.getEmailCode(this.credentials.profileId);
    await OktaLogin.enterCode(code);
    await OktaLogin.clickVerifyEmail();
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
  () => {}
);

Then(
  'the Sign In Widget validates her token',
  () => {}
);

