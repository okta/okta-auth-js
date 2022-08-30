const REPORT_DIR = '../../build2/reports/tsd';

module.exports = {
  runner: 'jest-runner-tsd',
  testMatch: ['**/*.test-d.ts'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: REPORT_DIR,
      suiteNameTemplate: '{filename}',
      classNameTemplate: '{title}',
    }]
  ]
};
