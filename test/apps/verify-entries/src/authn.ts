import { OktaAuth } from '@okta/okta-auth-js/authn';

const authClient = new OktaAuth({
  issuer: process.env.ISSUER,
  clientId: process.env.SPA_CLIENT_ID,
});
authClient.signInWithCredentials({
  username: 'fake-username',
  password: 'fake-password',
}).then(console.log);
