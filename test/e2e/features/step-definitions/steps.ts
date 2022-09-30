import { Given, When, Then } from '@wdio/cucumber-framework';

Given(/^I am on the (\w+) page$/, async (page) => {
    await browser.url(`http://localhost:8080/`);
});

When(/^I login with (\w+) and (.+)$/, async (username, password) => {
    await $('#username').setValue(username);
    await $('#password').setValue(password);
    await $('#login-direct').click();
});

Then(/^I should see an error message saying (.*)$/, async (message) => {
    await expect($('#error')).toBeExisting();
});

