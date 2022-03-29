// https://typedoc.org/guides/installation/#node-module
const TypeDoc = require('typedoc');

// This script currently only generate docs for myaccount module
(async () => {
  const app = new TypeDoc.Application();

  app.options.addReader(new TypeDoc.TSConfigReader());

  app.bootstrap({
    // typedoc options here
    entryPoints: [
      'lib/myaccount/index.ts',
      'lib/myaccount/types.ts'
    ],
    name: '@okta/okta-auth-js/myaccount',
    readme: 'lib/myaccount/README.md',
    githubPages: false,
    treatWarningsAsErrors: true,
    gitRevision: 'master'
  });

  const project = app.convert();
  if (project) {
    // Project may not have converted correctly
    const outputDir = 'docs/myaccount';

    // Rendered docs
    await app.generateDocs(project, outputDir);
  }
})();
