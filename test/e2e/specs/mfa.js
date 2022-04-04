import MFATestApp from '../pageobjects/MFATestApp';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const SECURITY_QUESTION_ANSWER = process.env.SECURITY_QUESTION_ANSWER;

describe('MFA', () => {
  it('can login direct with password + security question', async () => {
    await MFATestApp.open();
    // await MFATestApp.startLoginForm();
    // await MFATestApp.login(USERNAME, PASSWORD);
    // await MFATestApp.selectAuthenticator('question');
    // await MFATestApp.verifyAnswer(SECURITY_QUESTION_ANSWER);
    // await MFATestApp.assertUserInfo();
    // await MFATestApp.logout();
  });
});