/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

export function bind(fn, ctx) {
  var additionalArgs = Array.prototype.slice.call(arguments, 2);
  return function() {
    var args = Array.prototype.slice.call(arguments);
    args = additionalArgs.concat(args);
    return fn.apply(ctx, args);
  };
}

// TODO: replace all references with `Object.assign` then remove this function
export function extend() {
  // First object will be modified!
  var obj1 = arguments[0];
  // Properties from other objects will be copied over
  var objArray = [].slice.call(arguments, 1);
  objArray.forEach(function(obj) {
    for (var prop in obj) {
      // copy over all properties with defined values
      if (Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop] !== undefined) {
        obj1[prop] = obj[prop];
      }
    }
  });
  return obj1; // return the modified object
}

export function removeNils(obj) {
  var cleaned = {};
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      var value = obj[prop];
      if (value !== null && value !== undefined) {
        cleaned[prop] = value;
      }
    }
  }
  return cleaned;
}

export function clone(obj) {
  if (obj) {
    var str = JSON.stringify(obj);
    if (str) {
      return JSON.parse(str);
    }
  }
  return obj;
}

// Analogous to _.omit
export function omit(obj, ...props: any[]) {
  // var props = Array.prototype.slice.call(arguments, 1);
  var newobj = {};
  for (var p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p) && props.indexOf(p) == -1) {
      newobj[p] = obj[p];
    }
  }
  return clone(newobj);
}

export function find(collection, searchParams) {
  var c = collection.length;
  while (c--) {
    var item = collection[c];
    var found = true;
    for (var prop in searchParams) {
      if (!Object.prototype.hasOwnProperty.call(searchParams, prop)) {
        continue;
      }
      if (item[prop] !== searchParams[prop]) {
        found = false;
        break;
      }
    }
    if (found) {
      return item;
    }
  }
}

export function getLink(obj, linkName, altName?) {
  if (!obj || !obj._links) {
    return;
  }

  var link = clone(obj._links[linkName]);

  // If a link has a name and we have an altName, return if they match
  if (link && link.name && altName) {
    if (link.name === altName) {
      return link;
    }
  } else {
    return link;
  }
}

