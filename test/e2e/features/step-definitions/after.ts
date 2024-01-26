import { After } from '@wdio/cucumber-framework';
import ActionContext from '../../../../samples/test/support/context';
import deleteSelfEnrolledUser from '../../../../samples/test/support/management-api/deleteSelfEnrolledUser';


// Comment out this after hook to persist test context
// Extend the hook timeout to fight against org rate limit
/* eslint complexity:[0,10] */
After({ timeout: 3 * 60 * 10000 }, async function(this: ActionContext) {
  if (this.app) {
    await this.app.deactivate();
    await this.app.delete();
  }
  if (this.policies) {
    for (const policy of this.policies) {
      await policy.delete();
    }
  }
  if (this.group) {
    await this.group.delete();
  }
  if(this.user && this.user.profile.email !== process.env.USERNAME) {
    await this.user.deactivate();
    await this.user.delete();
  }
  if (this.credentials) {
    if (this.credentials.emailAddress !== process.env.USERNAME) {
      await deleteSelfEnrolledUser(this.config, { 
        username: this.credentials.emailAddress 
      });
    }
    await this.a18nClient.deleteProfile(this.credentials.profileId);
  }
  if (this.secondCredentials) {
    await this.a18nClient.deleteProfile(this.secondCredentials.profileId);
  }
});

After(async () => {
  await browser.deleteCookies();
  await browser.reloadSession();
});