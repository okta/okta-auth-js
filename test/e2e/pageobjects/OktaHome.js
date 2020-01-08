/* eslint-disable max-len */
class OktaLogin {
  get userMenu() { return $('[data-se="user-menu"] > a.link-button');}
  get signOutBtn() { return $('[data-se="user-menu"] a[data-se="logout-link"]'); }

  async signOut() {
    await browser.waitUntil(async () => this.userMenu.then(el => el.isDisplayed()), 5000, 'wait for user menu');
    await await this.userMenu.then(el => el.click());
    await browser.waitUntil(async () => this.signOutBtn.then(el => el.isDisplayed()), 5000, 'wait for signout btn');
    const url = await browser.getUrl();
    await this.signOutBtn.then(el => el.click());
    await browser.waitUntil(async () => browser.getUrl().then(cur => (cur !== url)), 5000, 'wait for url change');
  }

  async waitForLoad() {
    await browser.waitUntil(async () => this.userMenu.then(el => el.isDisplayed()), 5000, 'wait for user menu');
  }
}

export default new OktaLogin();
