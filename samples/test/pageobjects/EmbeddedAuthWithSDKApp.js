import assert from 'assert';

class EmbeddedAuthWithSDKApp {
  get formMessages() { return $('#form-messages .list'); }

  async open() {
    await browser.url('');
  }

  async assertLoginCallbackFailure(errorMessage) {
    await this.formMessages.then(el => el.getText()).then(txt => {
      assert(txt.trim() === errorMessage);
    });
  }
}

export default new EmbeddedAuthWithSDKApp();
