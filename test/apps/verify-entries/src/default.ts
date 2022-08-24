import { OktaAuth } from '@okta/okta-auth-js';

new OktaAuth({
  issuer: process.env.ISSUER,
  clientId: process.env.SPA_CLIENT_ID,
});
