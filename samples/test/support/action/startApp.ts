import { getAppUrl } from '../../util/appUtils';

export default async (
  url = '/',
  queryParams: Record<string, string> = {}
) => {
  if (queryParams.flow === 'widget' && process.env.ORG_OIE_ENABLED) {
    queryParams.useInteractionCodeFlow = 'true';
  }
  await browser.url(getAppUrl(url, queryParams));
};
