/* eslint-disable complexity */
import { Input } from '../../types';

export function unwrapFormValue(remediation): Input { 
  const res = {};
  for (const [key, value] of Object.entries(remediation)) {
    if (value === null || typeof value === 'undefined') {
      continue;
    }

    if (Array.isArray(value)) {
      res[key] = value.map(unwrapFormValue);
    } else if (typeof value === 'object') {
      const formKeys = Object.keys(value as object);
      // detect patterns like:
      // value -> form -> value | form -> value
      if (['value', 'form'].includes(key) 
        && formKeys.length === 1 
        && ['value', 'form'].includes(formKeys[0])
      ) {
        // unwrap nested form
        const unwrappedForm = unwrapFormValue(value);
        Object.entries(unwrappedForm).forEach(([key, value]) => {
          res[key] = value;
        });
      } else {
        // dfs
        res[key] = unwrapFormValue(value);
      }
    } else {
      // handle primitive value
      res[key] = value;
    }
  }

  return res as Input;
}

// only check if value is required for now
// TODO: support SDK layer type based input validation
export function hasValidInputValue(input, values) {
  const fn = (input, values, requiredTracker) => {
    const { name, value, required } = input;
    const isRequired = required || requiredTracker;

    if (Array.isArray(value)) {
      return value.reduce((acc, item) => {
        return acc && fn(item, values[name], isRequired);
      }, true);
    }

    if (!isRequired) {
      return true;
    }
      
    return !!(values && values[name]);
  };

  return fn(input, values, false);
}
