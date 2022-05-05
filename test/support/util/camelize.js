// from https://stackoverflow.com/a/2970667
export default function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) {
      return ''; // or if (/\s+/.test(match)) for white spaces
    }
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}
