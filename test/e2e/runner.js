const spawn = require('cross-spawn');
const waitOn = require('wait-on');

// 1. start the dev server
const server = spawn('yarn', [
  '--cwd',
  '../app',
  'start'
], { stdio: 'inherit' });

waitOn({
  resources: [
    'http-get://localhost:8080'
  ]
}).then(() => {
  // 2. run webdriver based on if sauce is needed or not
  let wdioConfig = 'wdio.conf.js';
  if (process.env.RUN_SAUCE_TESTS) {
    wdioConfig = 'sauce.wdio.conf.js';
  }

  let opts = process.argv.slice(2); // pass extra arguments through
  const runner = spawn('./node_modules/.bin/wdio', [
    'run',
    wdioConfig
  ].concat(opts), { stdio: 'inherit' });

  runner.on('exit', function (code) {
    server.kill();
    // eslint-disable-next-line no-process-exit
    process.exit(code);
  });
  runner.on('error', function (err) {
    server.kill();
    throw err;
  });
});
