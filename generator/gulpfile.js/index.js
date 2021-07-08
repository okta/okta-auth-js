const { parallel } = require('gulp');

const reactTasks = require('./react');

module.exports = {
  default: parallel(
    reactTasks.default
  ),
  'generate:react': reactTasks.default,
  'dev:react': reactTasks.dev
}
