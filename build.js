'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');

const NPM_DIR = 'dist';
const BUNDLE_CMD = 'yarn build:web';
const BUNDLES_DIR = `${NPM_DIR}/bundles`;
const BABEL_CMD = 'yarn build:server';

shell.echo('Start building...');

shell.rm('-Rf', `${NPM_DIR}/*`);
shell.mkdir('-p', `./${BUNDLES_DIR}`);

// Bundle browser code using webpack
if (shell.exec(BUNDLE_CMD).code !== 0) {
  shell.echo(chalk.red('Error: Webpack failed'));
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

shell.cp('-Rf', ['package.json', 'LICENSE', 'THIRD-PARTY-NOTICES', '*.md'], `${NPM_DIR}`);

shell.echo('Modifying final package.json');
let packageJSON = JSON.parse(fs.readFileSync(`./${NPM_DIR}/package.json`));
packageJSON.private = false;
packageJSON.scripts.prepare = '';
fs.writeFileSync(`./${NPM_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

shell.echo(chalk.green('End building'));
