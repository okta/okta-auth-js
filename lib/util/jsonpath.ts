import { JSONPath, JSONPathOptions } from 'jsonpath-plus';

// export function jsonpath(options: JSONPathOptions): any {
//   // eslint-disable-next-line new-cap
//   return JSONPath({
//     // Disable javascript evaluation by default
// 	  eval: false,...options,
//   });
// }

const jsonpathRegex = /\$?(?<step>\w+)|(?:\[(?<index>\d+)\])/g;

export function jsonpath({ path, json }) {
  const steps: string[] = [];
  let match: RegExpExecArray | null;
	while ((match = jsonpathRegex.exec(path)) !== null) {
		const step = match?.groups?.step ?? match?.groups?.index;
    if (step) {
      steps.push(step);
    }
	}

  if (steps.length < 1) {
    return [undefined];
  }

  // array length check above guarantees .pop() will return a value
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastStep = steps.pop()!;
  let curr = json;
  for (const step of steps) {
    if (curr.hasOwnProperty(step)) {
      if (!curr[step] || typeof curr[step] !== 'object') {
        // TODO: does this need to be an array?
        return [undefined];
      }

      curr = curr[step];
    }
  }

  // TODO: does this need to be an array?
  return [curr[lastStep]];
}
