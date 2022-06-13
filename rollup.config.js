import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import cleanup from 'rollup-plugin-cleanup';
import typescript from 'rollup-plugin-typescript2';
import license from 'rollup-plugin-license';
import pkg from './package.json';

const path = require('path');

const makeExternalPredicate = (env) => {
  const externalArr = [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ];
  if (env === 'node') {
    externalArr.push('crypto');
  }
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

const extensions = ['js', 'ts'];
const output = {
  format: 'es',
  exports: 'named',
  sourcemap: true,
  preserveModules: true,
  // not using .mjs extension because it causes issues with Vite
  // entryFileNames: '[name].mjs'
};

const getPlugins = (env) => {
  return [
    replace({
      'SDK_VERSION': JSON.stringify(pkg.version),
      'global.': 'window.',
      preventAssignment: true
    }),
    (env === 'browser' && alias({
      entries: [
        { find: /.\/node$/, replacement: './browser' }
      ]
    })),
    typescript({
      // eslint-disable-next-line node/no-unpublished-require
      typescript: require('typescript'),
      tsconfigOverride: {
        compilerOptions: {
          sourceMap: true,
          target: 'ES2017', // skip async/await transpile,
          module: 'ES2020', // support dynamic import
          declaration: false
        }
      }
    }),
    cleanup({
      extensions,
      comments: 'none'
    }),
    license({
      banner: {
        content: {
          file: path.join(__dirname, 'scripts', 'license-template'),
        }
      }
    })
  ];
};

export default [
  // main
  {
    type: 'browser',
    input: 'lib/index.ts',
    outputDir: 'build/esm/browser',
  },
  {
    type: 'node',
    input: 'lib/index.ts',
    outputDir: 'build/esm/node',
  },
  // myaccount module
  {
    type: 'browser',
    input: 'lib/myaccount/index.ts',
    outputDir: 'build/esm/browser/myaccount',
  },
  {
    type: 'node',
    input: 'lib/myaccount/index.ts',
    outputDir: 'build/esm/node/myaccount',
  }
].map(({ input, type, outputDir }) => {
  return {
    input,
    external: makeExternalPredicate(type),
    plugins: getPlugins(type),
    output: [
      {
        ...output,
        dir: outputDir
      }
    ]
  };
});
