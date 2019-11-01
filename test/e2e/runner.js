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
  // 2. run webdriver

  let opts = process.argv.slice(2); // pass extra arguments through
  const runner = spawn('./node_modules/.bin/wdio', [
    'run',
    'wdio.conf.js'
  ].concat(opts), { stdio: 'inherit' });

  runner.on('exit', function (code) {
    server.kill();
    process.exit(code);
  });
  runner.on('error', function (err) {
    server.kill();
    throw err;
  });
});
