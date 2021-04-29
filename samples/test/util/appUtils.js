import { getConfig } from './configUtils';
import toQueryString from './toQueryString';

async function startApp(App, options) {
  await App.open(Object.assign({}, getConfig(), options));
}

function getAppUrl(basePath = '/', queryParams = {}) {
  const query = toQueryString(Object.assign({}, getConfig(), queryParams));
  return basePath + query;
  
}

export { startApp, getAppUrl };
