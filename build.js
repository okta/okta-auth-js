'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');

const DIST_DIR = 'dist';
const BUNDLE_LIB_CMD = 'yarn build:web';
const BUNDLE_POLYFILL_CMD = 'yarn build:polyfill';
const BUNDLES_DIR = `${DIST_DIR}/bundles`;
const BABEL_CMD = 'yarn build:server';
const TS_CMD = 'yarn tsc';

shell.echo('Start building...');

shell.rm('-Rf', `${DIST_DIR}/*`);
shell.mkdir('-p', `./${BUNDLES_DIR}`);

// Run typescript to generate ESM module source
if (shell.exec(TS_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Typescript compilation failed'));
  shell.exit(1);
}

// Bundle browser code using webpack
if (shell.exec(BUNDLE_LIB_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Webpack of lib failed'));
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

shell.cp('-Rf', ['package.json', 'LICENSE', 'THIRD-PARTY-NOTICES', '*.md', 'polyfill'], `${DIST_DIR}`);

shell.echo('Modifying final package.json');
let packageJSON = JSON.parse(fs.readFileSync(`./${DIST_DIR}/package.json`));
packageJSON.private = false;
packageJSON.scripts.prepare = '';
fs.writeFileSync(`./${DIST_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

shell.echo(chalk.green('End building'));
