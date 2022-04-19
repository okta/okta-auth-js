import { IdxContext, NextStep, Input } from '../types';
import { Remediator } from './Base/Remediator';

export class GenericRemediator extends Remediator {
  canRemediate(): boolean {
    const inputs = this.getInputs();
    const res = inputs.reduce((acc, { name, required }) => {
      if (required) {
        return acc && !!this.values[name];
      }
      return acc;
    }, true);
    return res;
  }

  getData() {
    const data = this.remediation.value!.reduce((acc, { name, form }) => {
      // get data for form remediation value
      if (form) {
        const fieldName = form.value[0].name;
        acc[name] = {};
        acc[name][fieldName] = this.values[fieldName];
        return acc;
      }
      // map value for single level remediation value
      acc[name] = this.values[name];
      return acc;
    }, {});
    return data;
  }

  getNextStep(_context?: IdxContext): NextStep {
    const name = this.getName();
    const inputs = this.getInputs();
    return {
      name,
      inputs
    };
  }

  getInputs(): Input[] {
    return this.remediation.value!.filter(item => {
      return item.name !== 'stateHandle';
    })
    // .map(requiredField)
    .map(item => {
      // flatten form values
      if (item.form) {
        const { form, ...rest } = item;
        return { ...rest, ...form.value[0] };
      }
      // return all fields for single level remediation value
      return item;
    });
  }

}