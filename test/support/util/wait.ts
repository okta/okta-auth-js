export function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
