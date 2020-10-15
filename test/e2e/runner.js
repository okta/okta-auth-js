/* eslint-disable no-console */
const spawn = require('cross-spawn');
const waitOn = require('wait-on');
const port = 8080;
let server;

// 1. wait for the port to be free
waitOn({
  resources: [
    `http-get://localhost:${port}`
  ],
  reverse: true,
  timeout: 15000
}).then(() => {
  // 2. start the dev server
  server = spawn('yarn', [
    '--cwd',
    '../app',
    'start'
  ], { stdio: 'inherit' });

  return waitOn({
    resources: [
      `http-get://localhost:${port}`
    ]
  });
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
  runner.on('close', function (code, signal) {
    console.log(`Test runner exited with code ${code} via signal ${signal}`);
    returnCode = code;
    server.kill();
  });
  runner.on('error', function (err) {
    console.error('Test runner emitted an error: ', err);
    runner.kill();
  });
  server.on('close', function(code, signal) {
    console.log(`Server exited with code: ${code} via signal ${signal}`);
    // eslint-disable-next-line no-process-exit
    process.exit(returnCode);
  });
});
