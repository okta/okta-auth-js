
import { OktaAuth } from '@okta/okta-auth-js';

describe('OktaAuth (api)', function() {
  let auth;
  let issuer;

  beforeEach(function() {
    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  it('is a valid constructor', function() {
    expect(auth instanceof OktaAuth).toBe(true);
  });
});