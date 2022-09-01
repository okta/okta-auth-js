import { OktaAuth } from '@okta/okta-auth-js/idx';

const authClient = new OktaAuth({
  issuer: process.env.ISSUER,
  clientId: process.env.SPA_CLIENT_ID,
});
authClient.idx.start().then(console.log);
