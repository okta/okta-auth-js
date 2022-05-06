import { Application } from '@okta/okta-sdk-nodejs';
import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  app: Application;
  settings: Record<string, string>;
}

export const updateAppOAuthClient = async (
  config: OktaClientConfig, 
  options: Options
) => {
  const oktaClient = getOktaClient(config);

  const { app, settings } = options;
  const url = `${oktaClient.baseUrl}/api/v1/internal/apps/${app.id}/settings/oidc`;
  const body = {
    ...(app.settings as any).oauthClient,
    ...settings,
    label: app.label
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const res = await oktaClient.http.postJson(url, { body });
  return res;
}
