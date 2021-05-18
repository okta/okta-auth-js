import { IdxRemediation } from '../types/idx-js';

export function getAllValues(idxRemediation: IdxRemediation) {
  return idxRemediation.value.map(r => r.name);
}

export function getRequiredValues(idxRemediation: IdxRemediation) {
  return idxRemediation.value.reduce((required, cur) => {
    if (cur.required) {
      required.push(cur.name);
    }
    return required;
  }, []);
}

export function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
