export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getMessageVariant(errorClass) {
  return {
    'ERROR': 'danger'
  }[errorClass];
}

export function formToObject(form) {
  const formData = new FormData(form);
  console.log(formData, formData.entries())
  const data = {};
  for (let [key, value] of formData.entries()) {
    console.log(key, value)
    data[key] = value;
  }
  return data;
}
