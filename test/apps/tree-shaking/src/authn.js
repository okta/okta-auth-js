/* eslint-disable */
import { OktaAuth } from '@okta/okta-auth-js/core';
import { useAuthnTransactionAPI } from '@okta/okta-auth-js/authn';

let oktaAuth = new OktaAuth({ 
  issuer: 'https://xxx.okta.com',
  clientId: '0oal89rzfrHjIVqQw5d6'
});
oktaAuth = useAuthnTransactionAPI(oktaAuth);
