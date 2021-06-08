import { Before } from '@cucumber/cucumber';
import ActionContext from '../support/context';

Before(function (this: ActionContext, scenario: any) {
  this.featureName = scenario?.gherkinDocument?.feature?.name?.substring(0, 32);
});
