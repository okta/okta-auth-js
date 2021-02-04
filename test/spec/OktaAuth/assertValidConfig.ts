
import { OktaAuth } from '@okta/okta-auth-js';

describe('assertValidConfig', () => {

  it('throw an error if no arguments are passed to the constructor', function () {
    var err;
    try {
      new OktaAuth(undefined); // eslint-disable-line no-new
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