// bind methods called from HTML to prevent navigation
function bindClick(method, boundArgs) {
  return function(e) {
    e.preventDefault();
    const runtimeArgs = Array.prototype.slice.call(arguments, 1);
    try {
      method.apply(null, runtimeArgs.concat(boundArgs));
    } catch (err) {
      showError(err);
    }
    return false;
  };
}

function stringify(obj) {
  // Convert false/undefined/null into "null"
  if (!obj) {
    return 'null';
  }
  return JSON.stringify(obj, null, 2);
}
