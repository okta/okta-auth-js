const REPORT_DIR = '../../build2/reports/tsd';

let counts = {};

module.exports = {
  runner: 'jest-runner-tsd',
  testMatch: ['**/*.test-d.ts'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: REPORT_DIR,
      suiteNameTemplate: (vars) => `${vars.filename}`,
      classNameTemplate: (vars) => {
        if (!counts[vars.filename]) {
          counts[vars.filename] = 0;
        }
        counts[vars.filename] = counts[vars.filename] + 1;
        return `${vars.filename} ${counts[vars.filename]}`;
      }
    }]
  ]
};
