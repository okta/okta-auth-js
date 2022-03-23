import { generateState } from '@okta/okta-auth-js';
import { getUrl } from './APIUtils';

const makeRequest = async (oktaAuth, options) => {
  const replaceLinksWithFns = (item) => {
    const newItem = Object.entries(item._links)
      .reduce((acc, [ key, value ]) => {
        if (key === 'self' && value.hints) {
          value.hints.allow.forEach(method => {
            acc[method.toLowerCase()] = async (options) => {
              return makeRequest(oktaAuth, {
                url: value.href,
                method,
                ...options
              });
            };
          });
        } else {
          acc[key] = async (options) => {
            return makeRequest(oktaAuth, {
              url: value.href,
              method: value.hints.allow[0],
              ...options
            });
          };
        }
        return acc;
      }, item);
    delete newItem._links;
    return newItem;
  };
  
  const { url, method, data } = options;
  return oktaAuth.invokeApiMethod({
    headers: { 'Accept': '*/*;okta-version=1.0.0' },
    url,
    method,
    args: data
  }).then(res => {
    let newRes;
    if (Array.isArray(res)) {
      newRes = res.map(item => replaceLinksWithFns(item));
      newRes.headers = res.headers;
    } else if(res) {
      res = replaceLinksWithFns(res);
    }
    return res;
  });
};

export const getProfile = async (oktaAuth) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, '/idp/myaccount/profile'),
    method: 'GET'
  });
};

export const updateProfile = async (oktaAuth, profile) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, '/idp/myaccount/profile'),
    method: 'PUT',
    data: { profile }
  });
};

export const getEmails = async (oktaAuth) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, '/idp/myaccount/emails'),
    method: 'GET'
  });
};

export const addEmail = async (oktaAuth, payload) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, '/idp/myaccount/emails'),
    method: 'POST',
    data: {
      state: generateState(),
      ...payload
    }
  });
};

export const updatePrimaryEmail = async (oktaAuth, emailId) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, `/idp/myaccount/emails/${emailId}/promote`),
    method: 'POST'
  });
};

export const deleteEmail = async (oktaAuth, emailId) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, `/idp/myaccount/emails/${emailId}`),
    method: 'DELETE'
  });
};

export const getPhones = async (oktaAuth) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, '/idp/myaccount/phones'),
    method: 'GET'
  });
};

export const addPhone = async (oktaAuth, phoneNumber) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, '/idp/myaccount/phones'),
    method: 'POST',
    data: {
      profile: {
        phoneNumber
      },
      sendCode: true,
      method: 'SMS'
    }
  });
};

export const deletePhone = async (oktaAuth, phoneId) => {
  return makeRequest(oktaAuth, {
    url: getUrl(oktaAuth, `/idp/myaccount/phones/${phoneId}`),
    method: 'DELETE'
  });
};
