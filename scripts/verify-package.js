function verifyWidgetVersion() {
  if (/^d16t-okta-signin-widget-.*/.test(process.env.BRANCH)) {
    console.log('Skipping verification of okta-signin-widget version for downstream artifact build');
    return;
  }

  const version = require('../node_modules/@okta/okta-signin-widget/package.json').version;
  const regex = /^(\d)+\.(\d)+\.(\d)+$/;
  if (regex.test(version) !== true) {
    throw new Error(`Invalid/beta version for okta-signin-widget: ${version}`);
  }
  console.log(`okta-signin-widget version is valid: ${version}`);
}

try {
  verifyWidgetVersion();
  console.log('verify-package finished successfully');
} catch (e) {
  console.error(e);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

