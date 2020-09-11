import { getConfig } from './configUtils';

async function startApp(App, options) {
  await App.open(Object.assign({}, getConfig(), options));
}

export { startApp };
