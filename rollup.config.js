import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import cleanup from 'rollup-plugin-cleanup';
import typescript from 'rollup-plugin-typescript2';
import license from 'rollup-plugin-license';
import multiInput from 'rollup-plugin-multi-input';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const path = require('path');

const makeExternalPredicate = (env) => {
  const externalArr = [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ].filter(n => n !== 'broadcast-channel');

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
  preserveModulesRoot: 'lib',
  // not using .mjs extension because it causes issues with Vite
  // entryFileNames: '[name].mjs'
};

const getPlugins = (env) => {
  return [
    nodeResolve({
      browser: true,
      resolveOnly: ['broadcast-channel']
    }),
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
    }),
    multiInput({ 
      relative: 'lib/',
    }),
  ];
};

export default ['browser', 'node'].map((type) => {
  return {
    input: [
      'lib/index.ts', 
      'lib/myaccount/index.ts'
    ],
    external: makeExternalPredicate(type),
    plugins: getPlugins(type),
    output: [
      {
        ...output,
        dir: `build/esm/${type}`,
      }
    ]
  };
});
