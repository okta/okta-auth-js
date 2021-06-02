import { After } from '@cucumber/cucumber';
import deleteUser from '../support/management-api/deleteUser';

After(deleteUser);
