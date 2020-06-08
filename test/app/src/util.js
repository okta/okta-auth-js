function htmlString(obj) {
  return JSON.stringify(obj, null, 2).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
}

function toQueryParams(obj) {
  var str = [];
  if (obj !== null) {
    for (var key in obj) {
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
