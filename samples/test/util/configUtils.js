const sampleName = process.env.SAMPLE_NAME;
const issuer = process.env.ISSUER;
const clientId = process.env.CLIENT_ID;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const webClientId = process.env.WEB_CLIENT_ID;
const clientSecret = process.env.WEB_CLIENT_SECRET;

const samplesConfig = require('../../config');
const sampleConfig = samplesConfig.getSampleConfig(sampleName);

const config = {
  sampleName,
  sampleConfig,
  issuer,
  clientId: sampleConfig.webApp ? webClientId : clientId,
  username,
  password,
  clientSecret
};

function getConfig() {
  return Object.assign({}, config);
}

function updateConfig(updates) {
  Object.assign(config, updates);
}

function getSampleConfig() {
  return Object.assign({}, sampleConfig);
}

function getSampleSpecs() {
  const specs = (sampleConfig.specs || []).map(spec => {
    return `specs/${spec}.js`;
  });
  return specs;
}

export { getConfig, updateConfig, getSampleConfig, getSampleSpecs };
