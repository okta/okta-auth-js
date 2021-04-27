import { getEmailVerificationCode, sleep, toQueryString } from '../util';

/* eslint-disable max-len */
class DirectAuthWebApp {
  // login
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get signinFormSubmit() { return $('#credentials-submit-button'); }
  // profile
  get profileButton() { return $('#profile-button');}
  get logoutButton() { return $('#logout-button');}
  get claimsTable() { return $('#claims-table');}
  get emailClaim() { return $('#claim-email');}
  // errors
  get errors() { return $('#errors');}
  // signup
  get firstName() { return $('#first-name') }
  get lastName() { return $('#last-name') }
  get email() { return $('#email') }
  get signupSubmit() { return $('#signup-submit-button'); }
  // email authenticator
  get emailVerificationCode() { return $('#verification-code') }
  get emailVerificationSubmit() { return $('#verify-submit-button'); }
  // password authenticator
  get newPasswordSubmit() { return $('#password-submit-button'); }
  get newPassword() { return $('#new-password') }
  get confirmPassword() { return $('#confirm-password') }

  async open(queryObj) {
    await browser.url(toQueryString(queryObj));
  }

  async loginDirect() {
    await (await this.signinFormSubmit).click();
  }

  // utils

  async waitForProfileButton() {
    return browser.waitUntil(
      async () => await (await this.profileButton).isDisplayed(),
      15000,
      'wait for profile button');
  }

  async waitForLogoutButton() {
    return browser.waitUntil(
      async () => await (await this.logoutButton).isDisplayed(),
      15000,
      'wait for logout button');
  }

  async waitForClaims() {
    await browser.waitUntil(async () => await (await this.claimsTable).isDisplayed());
  }

  async waitForError() {
    await browser.waitUntil(async () => await (await this.errors).isDisplayed());
    await sleep(1000);
  }

  async waitForPasswordAuthenticator() {
    await browser.waitUntil(
      async () => await (await this.confirmPassword).isDisplayed(),
      5000,
      'wait for password authenticator');
    await sleep(1000);
  }

  async waitForEmailAuthenticator() {
    await browser.waitUntil(
      async () => await (await this.emailVerificationCode).isDisplayed(),
      5000,
      'wait for email authenticator');
    await sleep(1000);
  }

  async clickButtonToNavigateTo(button, destinationPath) {
    await browser.waitUntil(async () => {
      // eslint-disable-next-line no-undef
      const currentPath = await browser.execute(() => window.location.pathname);
      const isOnDestinationPage = currentPath === destinationPath;
      if (!isOnDestinationPage) {
        await (await button).click();
      }
      return isOnDestinationPage;
    }, 5000);
  }

  async assertError(expectedError) {
    await this.waitForError();
    expect(await(await this.errors).getText())
      .toContain(expectedError);
  }

  // 

  async viewProfilePage() {
    await this.waitForProfileButton();
    await this.clickButtonToNavigateTo(this.profileButton, '/profile');
    await this.waitForClaims();
    await sleep(2000);
  }

  async logout() {
    await this.waitForLogoutButton();
    await this.clickButtonToNavigateTo(this.logoutButton, '/');
    (await this.logoutButton).click();
    await sleep(1000);
  }

  async startRegistration(options) {
    browser.url('/signup');
    await (await this.firstName).setValue(options.firstName);
    await (await this.lastName).setValue(options.lastName);
    await (await this.email).setValue(options.email);
    await (await this.signupSubmit).click();
  }

  async enterNewPassword(options) {
    await this.waitForPasswordAuthenticator();
    await (await this.newPassword).setValue(options.password);
    await (await this.confirmPassword).setValue(options.password);
    await (await this.newPasswordSubmit).click();
  }

  async confirmEmail(options) {
    const { email } = options;
    await this.waitForEmailAuthenticator();
      
    await sleep(process.env.CODE_WAIT_TIME || 5000);
    const emailVerificationCode = await getEmailVerificationCode(email);

    await (await this.emailVerificationCode).setValue(emailVerificationCode);
    await (await this.emailVerificationSubmit).click();
  }

  async assertProfile(options) {
    await this.viewProfilePage();
    expect(await (await this.emailClaim).getText()).toEqual(options.email);
  }

}

export default new DirectAuthWebApp();
