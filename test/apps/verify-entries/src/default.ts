import { OktaAuth } from '@okta/okta-auth-js';

const authClient = new OktaAuth({
  issuer: process.env.ISSUER,
  clientId: process.env.SPA_CLIENT_ID,
});
console.log(authClient);
