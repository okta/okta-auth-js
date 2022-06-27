/* eslint-disable complexity */
import { AuthSdkError } from '../../../errors';
import { Input } from '../../types';

export function unwrapFormValue(remediation): Input { 
  if (Array.isArray(remediation)) {
    return remediation
      .map(item => {
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return item;
        }
        return unwrapFormValue(item);
      }) as any;
  }

  const res = {};
  for (const [key, value] of Object.entries(remediation)) {
    if (value === null || typeof value === 'undefined') {
      continue;
    }

    if (typeof value === 'object') {
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
    const { name, value, type, options, required } = input;
    const isRequired = required || requiredTracker;

    // handle nested value - all required fields should be avaiable in values 
    if (Array.isArray(value)) {
      return value.reduce((acc, item) => {
        return acc && fn(item, values[name], isRequired); // recursive call
      }, true);
    }

    // handle options field
    // 1. object type options - check if each object field is required and value can be found from the selectedOption
    // 2. primitive options - required field is avaiable from top level
    // 3. unknown format - pass to backend for validation
    if (options) {
      // object type options
      if (type === 'object') {
        const selectedOption = values[name];
        if (!selectedOption) {
          return false;
        }
        if (!selectedOption.id) {
          // unknown option format, pass to backend for validation
          return true;
        }
        const optionSchema = options.find((option) => {
          const idSchema = option.value.find(({ name }) => name === 'id' );
          return idSchema.value === selectedOption.id;
        });
        if (!optionSchema) {
          return false;
        }
        return optionSchema.value
          .filter(({ required }) => !!required)
          .reduce((acc, { name }) => {
            return acc && !!selectedOption[name];
          }, true);
      }

      // primitive options, not required - always valid
      if (required === false) {
        return true;
      }

      // primitive options, required - check if value is available
      if (required === true) {
        return !!values[name];
      }

      // unknown options, throw
      throw new AuthSdkError(`Unknown options type, ${JSON.stringify(input)}`);
    }

    // base case
    if (!isRequired) {
      return true;
    }
      
    return !!(values && values[name]);
  };

  return fn(input, values, false);
}
