'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../..', 'build');
const BUNDLE_LIB_CMD = 'yarn build:web';
const BUNDLE_CDN_CMD = 'yarn build:cdn';
const BUNDLE_POLYFILL_CMD = 'yarn build:polyfill';
const DIST_DIR = `${BUILD_DIR}/dist`; // will be uploaded to CDN
const BUNDLE_ESM = 'yarn build:esm';
const BABEL_CJS = 'yarn build:cjs';
const TS_CMD = 'yarn build:types';

shell.echo('Start building...');

shell.rm('-Rf', `${BUILD_DIR}/*`);
shell.mkdir('-p', `${DIST_DIR}`);

// Generate types
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

// Bundle ES module
if (shell.exec(BUNDLE_ESM).code !== 0) {
  shell.echo(chalk.red('Error: Babel esm failed'));
  shell.exit(1);
}

// Babelify node/server commonJS code
if (shell.exec(BABEL_CJS).code !== 0) {
  shell.echo(chalk.red('Error: Babel cjs failed'));
  shell.exit(1);
}

shell.echo(chalk.green('Babel completed'));

shell.echo(chalk.green('Bundling completed'));

shell.cp('-Rf', [
  'package.json', 
  'LICENSE', 
  'THIRD-PARTY-NOTICES', 
  '*.md', 
  'polyfill',
  '.npmignore'
], `${BUILD_DIR}`);

shell.echo('Modifying final package.json');
let packageJSON = JSON.parse(fs.readFileSync(`${BUILD_DIR}/package.json`));
packageJSON.private = false;
delete packageJSON.scripts.prepare;
delete packageJSON.workspaces;          // fixes workspace warning
delete packageJSON.engines.yarn;

function removeBuildDir(val) {
  if (typeof val === 'string') {
    return val.replace('build/', '');
  }

  if (typeof val === 'object') {
    return Object.entries(val).reduce((acc, [key, value]) => {
      acc[key] = removeBuildDir(value);
      return acc;
    }, {});
  }

  throw new Error('Value type not supported');
}

// Remove "build/" from the entrypoint paths.
['main', 'module', 'browser', 'types', 'exports', 'react-native'].forEach(function(key) {
  packageJSON[key] = removeBuildDir(packageJSON[key]);
});

fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

shell.echo(chalk.green('End building'));
