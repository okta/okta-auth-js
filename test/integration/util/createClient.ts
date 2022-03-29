import { OktaAuth } from '../../../lib';

// Cleanup clients after test completes
const activeClients: OktaAuth[] = [];
afterEach(() => {
  activeClients.forEach(client => {
    client.tokenManager.clearExpireEventTimeoutAll();
  });
  activeClients.splice(0);
});

export function createClient(options) {
  const issuer = process.env.ISSUER;
  const clientId = process.env.SPA_CLIENT_ID || process.env.CLIENT_ID;
  const redirectUri = 'http://localhost:8080/login/callback';
  options = Object.assign({
    issuer,
    clientId,
    redirectUri,
    transactionManager: {
      saveNonceCookie: false,
      saveStateCookie: false,
      saveParamsCookie: false
    }
  }, options);
  const client = new OktaAuth(options);
  activeClients.push(client);
  return client;
}
