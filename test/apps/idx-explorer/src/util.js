export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getMessageVariant(errorClass) {
  return {
    'ERROR': 'danger'
  }[errorClass];
}
