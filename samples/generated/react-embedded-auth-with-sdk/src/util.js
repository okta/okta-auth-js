export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getMessageVariant(errorClass) {
  return {
    'ERROR': 'danger'
  }[errorClass];
}

// from https://stackoverflow.com/a/2970667
export function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) {
      return ''; // or if (/\s+/.test(match)) for white spaces
    }
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}
