import { Application, Client } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';


export default async function(app: Application, options: any) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  const orgUrl = config.issuer?.replace('/oauth2/default', '');
  const url = `${orgUrl}/api/v1/internal/apps/${app.id}/settings/oidc`;
  const body = {
    ...(app.settings as any).oauthClient,
    ...options,
    label: app.label
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const res = await oktaClient.http.postJson(url, { body });
  return res;
}
