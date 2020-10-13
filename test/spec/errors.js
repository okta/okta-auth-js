jest.mock('cross-fetch');

import _ from 'lodash';
import util from '@okta/test.support/util';
import { OktaAuth } from '@okta/okta-auth-js';

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
      return test.oa.signIn({username: 'fake', password: 'fake'});
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
      return test.oa.signIn({username: 'fake', password: 'fake'});
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
      return test.oa.signIn({username: 'fake', password: 'fake'});
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
    expect(err.errorSummary).toEqual('No issuer passed to constructor. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  });

  it('throw an error if no issuer is passed to the constructor', function () {
    var err;
    try {
      new OktaAuth({}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('No issuer passed to constructor. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  });

  it('throw an error if issuer is not a url', function () {
    var err;
    try {
      new OktaAuth({issuer: 'default'}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('Issuer must be a valid URL. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  });

  it('throw an error if url contains "-admin" when passed to the constructor', function () {
    var err;
    try {
      new OktaAuth({issuer: 'https://dev-12345-admin.oktapreview.com'}); // eslint-disable-line no-new
    } catch (e) {
      err = e;
    }
    expect(err.name).toEqual('AuthSdkError');
    expect(err.errorSummary).toEqual('Issuer URL passed to constructor contains "-admin" in subdomain. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com})');
  });
});
