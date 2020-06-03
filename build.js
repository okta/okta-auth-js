'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');

const NPM_DIR = 'dist';
const BUNDLE_CMD = 'cross-env NODE_ENV=production webpack --config webpack.config.js --output-library-target=umd -p';
const BUNDLES_DIR = `${NPM_DIR}/bundles`;

shell.echo('Start building...');

shell.rm('-Rf', `${NPM_DIR}/*`);
shell.mkdir('-p', `./${BUNDLES_DIR}`);

// Bundle using webpack
if (shell.exec(BUNDLE_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Webpack failed'));
  shell.exit(1);
}

shell.echo(chalk.green('Bundling completed'));

shell.cp('-Rf', ['lib', 'package.json', 'LICENSE', 'THIRD-PARTY-NOTICES', '*.md'], `${NPM_DIR}`);

shell.echo('Modifying final package.json');
let packageJSON = JSON.parse(fs.readFileSync(`./${NPM_DIR}/package.json`));
packageJSON.private = false;
packageJSON.scripts.prepare = '';
fs.writeFileSync(`./${NPM_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

shell.echo(chalk.green('End building'));
