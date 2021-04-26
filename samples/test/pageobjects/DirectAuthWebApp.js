import toQueryString from '../util/toQueryString';


class DirectAuthWebApp {
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get signinFormSubmit() { return $('#credentials-submit-button'); }
  get profileButton() { return $('#profile-button');}
  get logoutButton() { return $('#logout-button');}
  get claimsTable() { return $('#claims-table');}
  get emailClaim() { return $('#claim-email');}
  get errorBanner() { return $('#error-banner');}


  async startFlow(flowId) {
    await (await $(`#${flowId} a`)).click();
  }

  async open(queryObj) {
    await browser.url(toQueryString(queryObj));
  }

  async loginDirect() {
    await (await this.signinFormSubmit).click();
  }

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

  async clickButtonToNavigateTo(button, destinationPath) {
    await browser.waitUntil(async () => {
      const currentPath = await browser.execute(() => window.location.pathname);
      const isOnDestinationPage = currentPath === destinationPath;
      if (!isOnDestinationPage) {
        console.log('not on ' + destinationPath);
        await (await button).click();
      }
      return isOnDestinationPage;
    }, 5000);
  }

  async viewProfilePage() {
    await this.waitForProfileButton();
    await this.clickButtonToNavigateTo(this.profileButton, '/profile');
    await browser.waitUntil(async () => await (await this.claimsTable).isDisplayed());
  }

  async logout() {
    await this.waitForLogoutButton();
    await this.clickButtonToNavigateTo(this.logoutButton, '/');
    (await this.logoutButton).click();
  }
}

export default new DirectAuthWebApp();