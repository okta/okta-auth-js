const samplesConfig = require('../../config');

function getSampleConfig() {
  const sampleName = process.env.SAMPLE_NAME;
  const sampleConfig = sampleName ? samplesConfig.getSampleConfig(sampleName) : {};
  return Object.assign({}, sampleConfig);
}

function getSampleSpecs() {
  const sampleConfig = getSampleConfig();
  const specs = (sampleConfig.specs || []).map(spec => {
    return `specs/${spec}.js`;
  });
  return specs;
}

function getSampleFeatures() {
  const sampleConfig = getSampleConfig();
  const specs = (sampleConfig.features || []).map(feature => {
    return `features/${feature}.feature`;
  });
  return specs;
}

function getConfig() {
  const issuer = process.env.ISSUER;
  const orgUrl = issuer.indexOf('/oauth2') > 0 ? issuer.substring(0, issuer.indexOf('/oauth2')) : issuer;
  const clientId = process.env.SPA_CLIENT_ID || process.env.CLIENT_ID;
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  const webClientId = process.env.WEB_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.WEB_CLIENT_SECRET || process.env.CLIENT_SECRET;
  const a18nAPIKey = process.env.A18N_API_KEY;
  const oktaAPIKey = process.env.OKTA_API_KEY;

  const sampleName = process.env.SAMPLE_NAME;
  const sampleConfig = getSampleConfig();
  const config = {
    sampleName,
    sampleConfig,
    issuer,
    orgUrl,
    clientId: sampleConfig.express ? webClientId : clientId,
    username,
    password,
    clientSecret,
    a18nAPIKey,
    oktaAPIKey,
  };

  return Object.assign({}, config);
}

export { getConfig, getSampleConfig, getSampleSpecs, getSampleFeatures };
