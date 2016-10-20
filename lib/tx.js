/* eslint-disable complexity */
var http              = require('./http');
var util              = require('./util');
var Q                 = require('q');
var AuthSdkError      = require('./errors/AuthSdkError');
var AuthPollStopError = require('./errors/AuthPollStopError');
var config            = require('./config');

function addStateToken(res, options) {
  var builtArgs = util.clone(options) || {};

  // Add the stateToken if one isn't passed and we have one
  if (!builtArgs.stateToken && res.stateToken) {
    builtArgs.stateToken = res.stateToken;
  }

  return builtArgs;
}

function getStateToken(res) {
  return addStateToken(res);
}

function transactionStatus(sdk, args) {
  args = addStateToken(sdk, args);
  return http.post(sdk, sdk.options.url + '/api/v1/authn', args);
}

function resumeTransaction(sdk, args) {
  if (!args || !args.stateToken) {
    var stateToken = sdk.tx.exists._getCookie(config.STATE_TOKEN_COOKIE_NAME);
    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Q.reject(new AuthSdkError('No transaction to resume'));
    }
  }
  return sdk.tx.status(args)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
}

function transactionExists(sdk) {
  // We have a cookie state token
  return !!sdk.tx.exists._getCookie(config.STATE_TOKEN_COOKIE_NAME);
}

function postToTransaction(sdk, url, options) {
  return http.post(sdk, url, options)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
}

function getPollFn(sdk, res, ref) {
  return function (options) {
    var delay;
    var rememberDevice;

    if (util.isNumber(options)) {
      delay = options;
    } else if (util.isObject(options)) {
      delay = options.delay;
      rememberDevice = options.rememberDevice;
    }

    if (!delay && delay !== 0) {
      delay = config.DEFAULT_POLLING_DELAY;
    }

    // Get the poll function
    var pollLink = util.getLink(res, 'next', 'poll');
    function pollFn() {
      var href = pollLink.href;
      if (rememberDevice) {
        href += '?rememberDevice=true';
      }
      return http.post(sdk, href, getStateToken(res), {
        saveAuthnState: false  
      });
    }

    ref.isPolling = true;

    var retryCount = 0;
    var recursivePoll = function () {

      // If the poll was manually stopped during the delay
      if (!ref.isPolling) {
        return Q.reject(new AuthPollStopError());
      }

      return pollFn()
        .then(function (pollRes) {
          // Reset our retry counter on success
          retryCount = 0;

          // If we're still waiting
          if (pollRes.factorResult && pollRes.factorResult === 'WAITING') {

            // If the poll was manually stopped while the pollFn was called
            if (!ref.isPolling) {
              throw new AuthPollStopError();
            }

            // Continue poll
            return Q.delay(delay)
              .then(recursivePoll);

          } else {
            // Any non-waiting result, even if polling was stopped
            // during a request, will return
            ref.isPolling = false;
            return new AuthTransaction(sdk, pollRes);
          }
        })
        .fail(function(err) {
          // Exponential backoff, up to 16 seconds
          if (err.xhr &&
              (err.xhr.status === 0 || err.xhr.status === 429) &&
              retryCount <= 4) {
            var delayLength = Math.pow(2, retryCount) * 1000;
            retryCount++;
            return Q.delay(delayLength)
              .then(recursivePoll);
          }
          throw err;
        });
    };
    return recursivePoll()
      .fail(function(err) {
        ref.isPolling = false;
        throw err;
      });
  };
}

function link2fn(sdk, res, obj, link, ref) {
  if (Array.isArray(link)) {
    return function(name, opts) {
      if (!name) {
        throw new AuthSdkError('Must provide a link name');
      }

      var lk = util.find(link, {name: name});
      if (!lk) {
        throw new AuthSdkError('No link found for that name');
      }

      return link2fn(sdk, res, obj, lk, ref)(opts);
    };

  } else if (link.hints &&
      link.hints.allow &&
      link.hints.allow.length === 1) {
    var method = link.hints.allow[0];
    switch (method) {

      case 'GET':
        return function() {
          return http.get(sdk, link.href);
        };

      case 'POST':
        return function(opts) {
          if (ref && ref.isPolling) {
            ref.isPolling = false;
          }

          var data = addStateToken(res, opts);

          if (res.status === 'MFA_ENROLL') {
            // Add factorType and provider
            util.extend(data, {
              factorType: obj.factorType,
              provider: obj.provider
            });
          }

          var href = link.href;
          if (data.rememberDevice !== undefined) {
            if (data.rememberDevice) {
              href += '?rememberDevice=true';
            }
            data = util.omit(data, 'rememberDevice');

          } else if (data.profile &&
                    data.profile.updatePhone !== undefined) {
            if (data.profile.updatePhone) {
              href += '?updatePhone=true';
            }
            data.profile = util.omit(data.profile, 'updatePhone');
          }

          return postToTransaction(sdk, href, data);
        };
    }
  }
}

function links2fns(sdk, res, obj, ref) {
  var fns = {};
  for (var linkName in obj._links) {
    if (!obj._links.hasOwnProperty(linkName)) {
      continue;
    }

    var link = obj._links[linkName];
    
    if (linkName === 'next') {
      linkName = link.name;
    }

    if (link.type) {
      fns[linkName] = link;
      continue;
    }

    switch (linkName) {
      // poll is only found at the transaction
      // level, so we don't need to pass the link
      case 'poll':
        fns.poll = getPollFn(sdk, res, ref);
        break;

      default:
        var fn = link2fn(sdk, res, obj, link, ref);
        if (fn) {
          fns[linkName] = fn;
        }
    }
  }
  return fns;
}

function flattenEmbedded(sdk, res, obj, ref) {
  obj = obj || res;
  obj = util.clone(obj);

  if (Array.isArray(obj)) {
    var objArr = [];
    for (var o = 0, ol = obj.length; o < ol; o++) {
      objArr.push(flattenEmbedded(sdk, res, obj[o], ref));
    }
    return objArr;
  }

  var embedded = obj._embedded || {};

  for (var key in embedded) {
    if (!embedded.hasOwnProperty(key)) {
      continue;
    }

    // Flatten any nested _embedded objects
    if (util.isObject(embedded[key]) || Array.isArray(embedded[key])) {
      embedded[key] = flattenEmbedded(sdk, res, embedded[key], ref);
    }
  }

  // Convert any links on the embedded object
  var fns = links2fns(sdk, res, obj, ref);
  util.extend(embedded, fns);

  obj = util.omit(obj, '_embedded', '_links');
  util.extend(obj, embedded);
  return obj;
}

function AuthTransaction(sdk, res) {
  if (res) {
    this.data = res;
    util.extend(this, flattenEmbedded(sdk, res, res, {}));
    delete this.stateToken;

    // RECOVERY_CHALLENGE has some responses without _links.
    // Without _links, we emulate cancel to make it intuitive
    // to return to the starting state. We may remove this
    // when OKTA-75434 is resolved
    if (res.status === 'RECOVERY_CHALLENGE' && !res._links) {
      this.cancel = function() {
        return new Q(new AuthTransaction(sdk));
      };
    }
  }
}

module.exports = {
  transactionStatus: transactionStatus,
  resumeTransaction: resumeTransaction,
  transactionExists: transactionExists,
  postToTransaction: postToTransaction
};
