var _ = require('lodash'),
    util = require('../util/util'),
    OktaAuth = require('OktaAuth');

describe('General Errors', function () {
  util.itErrorsCorrectly({
    title: 'returns correct error if throttle API error (429)',
    setup: {
      request: {
        uri: '/api/v1/authn',
        data: {}
      },
      response: 'error-throttle'
    },
    execute: function (test) {
      return test.oa.signIn({});
    }
  });

  util.itErrorsCorrectly({
    title: 'returns correct error if internal API error (500)',
    setup: {
      request: {
        uri: '/api/v1/authn',
        data: {}
      },
      response: 'error-internal'
    },
    execute: function (test) {
      return test.oa.signIn({});
    },
    expectations: function (test, err) {
      var expected = _.cloneDeep(test.responseBody);
      expected.errorSummary = 'Unknown error';

      // We explicitly defined the fields to compare,
      // because we don't want to compare all the xhr fields
      expect(err.xhr.status).toEqual(test.resReply.status);

      expect(err.errorCode).toEqual(expected.errorCode);
      expect(err.errorSummary).toEqual(expected.errorSummary);
      expect(err.errorLink).toEqual(expected.errorLink);
      expect(err.errorCode).toEqual(expected.errorCode);
      expect(err.errorId).toEqual(expected.errorId);
      expect(err.errorCauses).toEqual(expected.errorCauses);
    }
  });

  util.itErrorsCorrectly({
    title: 'returns correct error if network error (0)',
    setup: {
      request: {
        uri: '/api/v1/authn',
        data: {}
      },
      response: 'error-network'
    },
    execute: function (test) {
      return test.oa.signIn({});
    },
    expectations: function (test, err) {
      expect(err.name).toEqual('AuthApiError');
      expect(err.xhr.status).toEqual(0);
      expect(err.errorCode).toBeUndefined();
      expect(err.errorSummary).toBeUndefined();
      expect(err.errorLink).toBeUndefined();
      expect(err.errorCode).toBeUndefined();
      expect(err.errorId).toBeUndefined();
      expect(err.errorCauses).toBeUndefined();
    }
  });

  it('throw an error if no arguments are passed to the constructor', function () {
    var err;
    try {
      new OktaAuth(); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('No arguments passed to constructor. Required usage: new OktaAuth(args)');
  });

  it('throw an error if no url and no issuer are passed to the constructor', function () {
    var err;
    try {
      new OktaAuth({}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('No url passed to constructor. ' +
      'Required usage: new OktaAuth({url: "https://sample.okta.com"})');
  });

  it('throw an error if issuer is not a url and url is omitted when passed to the constructor', function () {
    var err;
    try {
      new OktaAuth({issuer: 'default'}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('No url passed to constructor. ' +
      'Required usage: new OktaAuth({url: "https://sample.okta.com"})');
  });

  it('throw an error if url contains "-admin" when passed to the constructor', function () {
    var err;
    try {
      new OktaAuth({url: 'https://dev-12345-admin.oktapreview.com'}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('URL passed to constructor contains "-admin" in subdomain. ' +
      'Required usage: new OktaAuth({url: "https://dev-12345.okta.com})');
  });
});
