'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');
const BUNDLE_LIB_CMD = 'yarn build:web';
const BUNDLE_CDN_CMD = 'yarn build:cdn';
const BUNDLE_POLYFILL_CMD = 'yarn build:polyfill';
const DIST_DIR = `${BUILD_DIR}/dist`; // will be uploaded to CDN
const BABEL_CMD = 'yarn build:server';
const TS_CMD = 'yarn tsc';

shell.echo('Start building...');

shell.rm('-Rf', `${BUILD_DIR}/*`);
shell.mkdir('-p', `${DIST_DIR}`);

// Run typescript to generate ESM module source
if (shell.exec(TS_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Typescript compilation failed'));
  shell.exit(1);
}

// Bundle browser code (UMD) using webpack
if (shell.exec(BUNDLE_LIB_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Webpack of UMD lib failed'));
  shell.exit(1);
}

// Bundle browser code (For CDN) using webpack
if (shell.exec(BUNDLE_CDN_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Webpack of CDN lib failed'));
  shell.exit(1);
}

// Bundle polyfill code using webpack
if (shell.exec(BUNDLE_POLYFILL_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Webpack of polyfill failed'));
  shell.exit(1);
}
shell.echo(chalk.green('Webpack completed'));

// Babelify node/server code
if (shell.exec(BABEL_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Babel failed'));
  shell.exit(1);
}

shell.echo(chalk.green('Babel completed'));

shell.echo(chalk.green('Bundling completed'));

shell.cp('-Rf', ['package.json', 'LICENSE', 'THIRD-PARTY-NOTICES', '*.md', 'polyfill'], `${BUILD_DIR}`);

shell.echo('Modifying final package.json');
let packageJSON = JSON.parse(fs.readFileSync(`${BUILD_DIR}/package.json`));
packageJSON.private = false;
packageJSON.scripts.prepare = '';

// Remove "build/" from the entrypoint paths.
['main', 'module', 'browser', 'react-native', 'types'].forEach(function(key) {
  packageJSON[key] = packageJSON[key].replace('build/', '');
});

fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

shell.echo(chalk.green('End building'));
