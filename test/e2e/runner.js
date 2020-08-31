/* eslint-disable no-console */
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

  let returnCode = 1;
  runner.on('exit', function (code) {
    console.log('Test runner exited with code: ' + code);
    returnCode = code;
    server.kill();
  });
  runner.on('error', function (err) {
    server.kill();
    throw err;
  });
  server.on('exit', function(code) {
    console.log('Server exited with code: ' + code);
    // eslint-disable-next-line no-process-exit
    process.exit(returnCode);
  });
});
