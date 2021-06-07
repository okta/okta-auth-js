import { After } from '@cucumber/cucumber';
import deleteContextUser from '../support/action/live-user/deleteContextUser';

After(deleteContextUser);
After(() => browser.deleteCookies());
