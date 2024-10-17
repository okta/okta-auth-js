const jsonpathRegex = /\$?(?<step>\w+)|(?:\[(?<index>\d+)\])/g;

/* eslint complexity:[0,8] */
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
    return undefined;
  }

  // array length check above guarantees .pop() will return a value
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastStep = steps.pop()!;
  let curr = json;
  for (const step of steps) {
    if (Object.prototype.hasOwnProperty.call(curr, step)) {
      if (typeof curr[step] !== 'object') {
        return undefined;
      }

      curr = curr[step];
    }
  }

  return curr[lastStep];
}
