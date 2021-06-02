import { After } from '@cucumber/cucumber';
import deleteTestGroup from '../support/management-api/deleteTestGroup';

After(deleteTestGroup);
