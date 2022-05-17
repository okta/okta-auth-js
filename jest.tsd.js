let counts = {};

module.exports = {
  runner: 'jest-runner-tsd',
  roots: [
    'test/types'
  ],
  testMatch: ['**/*.test-d.ts'],
  reporters: [
    'default',
    ['jest-junit', {
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
