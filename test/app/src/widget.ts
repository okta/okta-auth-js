import { Config } from './config';

export function buildIdpsConfig(config: Config): any {
  return config._idps.split(/\s+/).map(idpToken => {
      const [type, id] = idpToken.split(/:/);
      if (!type || !id) {
        return null;
      }
      return { type, id };
    }).filter(idpToken => idpToken);
}

export function buildWidgetConfig(config: Config): any {
  return Object.assign({}, config, {
    baseUrl: config.issuer.split('/oauth2')[0],
    el: '#widget',
    authParams: Object.assign(config, {
      display: 'page'
    }),
    idps: buildIdpsConfig(config)
  });
}
