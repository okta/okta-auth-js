/* global window */
const mocked = {
  crossFetch: jest.fn()
};

jest.mock('cross-fetch', () => {
  return mocked.crossFetch;
});

describe('fetchRequest', function () {
  let fetchSpy;

  let requestHeaders;
  let requestMethod;
  let requestUrl;
  let response;
  let responseHeaders;
  let responseJSON;
  let responseText;

  const fetchRequest = require('../../lib/fetch/fetchRequest').default;

  beforeEach(function() {
    mocked.crossFetch.mockReset();
    mocked.crossFetch.mockImplementation(() => {
      return Promise.resolve(response);
    });
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve(response);
    });
    responseHeaders = new Map();
    responseHeaders.set('Content-Type', 'application/json');
    responseJSON = { isFakeResponse: true };
    responseText = JSON.stringify(responseJSON);
    response = {
      headers: responseHeaders,
      status: 200,
      ok: true,
      json: function() {
        return Promise.resolve(responseJSON);
      },
      text: function() {
        return Promise.resolve(responseText);
      }
    };

    requestHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    requestMethod = 'GET';
    requestUrl = 'http://fakey.local';
  });

  describe('fetch implementation', () => {
    let defaultFetch;
    beforeEach(() => {
      defaultFetch = window.fetch;
      window.fetch = null;
    });
    afterEach(() => {
      window.fetch = defaultFetch;
    });
    it('uses cross-fetch if no native fetch', () => {
      return fetchRequest(requestMethod, requestUrl, {})
      .then(() => {
        expect(mocked.crossFetch).toHaveBeenCalled();
      });
    });
    it('uses native fetch if available', () => {
      const globalFetch = jest.fn(() => {
        return Promise.resolve(response);
      });
      window.fetch = globalFetch;
      return fetchRequest(requestMethod, requestUrl, {})
      .then(() => {
        expect(globalFetch).toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });
    it('fetchRequest returns a promise with finally on it', () => {
      const globalFetch = jest.fn(() => {
        return Promise.resolve(response);
      });
      window.fetch = globalFetch;
      const fetchRequestPromise = fetchRequest(requestMethod, requestUrl, {});
      expect(fetchRequestPromise.finally).toBeDefined();
    });
    it('fetchRequest returns a promise with finally on it even if fetch doesnt return a promise with fetch', () => {
      const globalFetch = jest.fn(() => {
        return {
          then: () => {},
          catch: () => {}
        };
      });
      window.fetch = globalFetch;
      const fetchRequestPromise = fetchRequest(requestMethod, requestUrl, {});
      expect(fetchRequestPromise.finally).toBeDefined();
    });
  });

  describe('request', () => {
    it('JSON encodes request body if request header Content-Type is application/json', function() {
      const requestJSON = {
        foo: 'bar'
      };
      return fetchRequest(requestMethod, requestUrl, {
        headers: requestHeaders,
        data: requestJSON
      })
      .then(() => {
        expect(fetchSpy).toHaveBeenCalledWith(requestUrl, {
          method: requestMethod,
          headers: requestHeaders,
          body: JSON.stringify(requestJSON),
          credentials: 'omit'
        });
      });
    });

    it('Leaves request body unchanged if request header Content-Type is NOT application/json', function() {
      requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      const requestText = 'string=1&fake=2';
      return fetchRequest(requestMethod, requestUrl, {
        headers: requestHeaders,
        data: requestText
      })
      .then(() => {
        expect(fetchSpy).toHaveBeenCalledWith(requestUrl, {
          method: requestMethod,
          headers: requestHeaders,
          body: requestText,
          credentials: 'omit'
        });
      });
    });


    it('Can include credentials', function() {
      return fetchRequest(requestMethod, requestUrl, {
        withCredentials: true
      })
      .then(() => {
        expect(fetchSpy).toHaveBeenCalledWith(requestUrl, {
          method: requestMethod,
          credentials: 'include'
        });
      });
    });
  });

  describe('response', () => {

    it('Returns JSON if response header Content-Type is application/json', function() {
      return fetchRequest(requestMethod, requestUrl, {})
      .then(res => {
        expect(res).toEqual({
          status: response.status,
          responseJSON,
          responseText,
          responseType: 'json'
        });
      });
    });

    it('Returns text if response header Content-Type is NOT application/json', function() {
      responseHeaders.set('Content-Type', 'application/x-www-form-urlencoded');
      return fetchRequest(requestMethod, requestUrl, {})
      .then(res => {
        expect(res).toEqual({
          status: response.status,
          responseText
        });
      });
    });

    it('Throws the response if response.ok is false (JSON)', () => {
      response.status = 401;
      response.ok = false;
      return fetchRequest(requestMethod, requestUrl, {})
      .catch(err => {
        expect(err).toEqual({
          status: response.status,
          responseText,
          responseType: 'json',
          responseJSON
        });
      });
    });

    it('Throws the response if response.ok is false (text)', () => {
      response.status = 401;
      response.ok = false;
      responseHeaders.set('Content-Type', 'application/x-www-form-urlencoded');
      return fetchRequest(requestMethod, requestUrl, {})
      .catch(err => {
        expect(err).toEqual({
          status: response.status,
          responseText
        });
      });
    });

    it('Throws the response if response.ok is false (invalid JSON)', () => {
      var error = new Error('A fake error, ignore me');
      response.status = 401;
      response.ok = false;
      response.json = function() {
        return Promise.reject(error);
      };

      var errorJSON = {
        error: error,
        errorSummary: 'Could not parse server response'
      };

      return fetchRequest(requestMethod, requestUrl, {})
      .catch(err => {
        expect(err).toEqual({
          status: response.status,
          responseText: JSON.stringify(errorJSON),
          responseJSON: errorJSON,
          responseType: 'json'
        });
      });
    });
  });
});
