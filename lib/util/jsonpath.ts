import { JSONPath, JSONPathOptions } from 'jsonpath-plus';

export function jsonpath(options: JSONPathOptions): any {
  // eslint-disable-next-line new-cap
  return JSONPath({
    // Disable javascript evaluation by default
	preventEval: true, ...options, });
}
