import { After } from '@cucumber/cucumber';
import deleteTestGroup from '../support/action/management-api/deleteTestGroup';

After(deleteTestGroup);
