
export default function toQueryParams(obj) {
  const str = [];
  if (obj !== null) {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) &&
          obj[key] !== undefined &&
          obj[key] !== null) {
        str.push(key + '=' + encodeURIComponent(obj[key]));
      }
    }
  }
  if (str.length) {
    return '?' + str.join('&');
  } else {
    return '';
  }
}
