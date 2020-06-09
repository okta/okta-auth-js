// This file is used by client & server code. It should remain compatible with NodeJS

function htmlString(obj) {
  return JSON.stringify(obj, null, 2).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
}

function toQueryParams(obj) {
  const str = [];
  if (obj !== null) {
    for (const key in obj) {
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

module.exports = {
  htmlString,
  toQueryParams 
};
