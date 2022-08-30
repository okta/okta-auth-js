module.exports = {
  runner: 'jest-runner-tsd',
  roots: [
    'test/types'
  ],
  testMatch: ['**/*.test-d.ts'],
  reporters: [
    'default',
    ['jest-junit', {
      suiteNameTemplate: '{filename}',
      classNameTemplate: '{title}',
    }]
  ]
};
