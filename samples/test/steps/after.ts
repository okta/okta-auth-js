import { After } from '@cucumber/cucumber';
import deleteUserAndCredentials from '../support/action/live-user/deleteUserAndCredentials';

After(deleteUserAndCredentials);
After(() => browser.deleteCookies());
