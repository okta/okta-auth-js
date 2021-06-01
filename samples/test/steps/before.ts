import { Before } from '@cucumber/cucumber';
import createTestGroup from '../support/action/management-api/createTestGroup';

Before(createTestGroup);
