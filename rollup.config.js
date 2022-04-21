import babel from '@rollup/plugin-babel';
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
    // not add @babel/runtime import for development
    // (process.env.NODE_ENV !== 'development' && babel({
    //   babelHelpers: 'runtime',
    //   presets: [
    //     '@babel/preset-env'
    //   ],
    //   plugins: [
    //     // https://babeljs.io/docs/en/babel-plugin-transform-runtime#corejs
    //     ['@babel/plugin-transform-runtime', { 
    //       corejs: 3 
    //     }],
    //   ],
    //   extensions
    // })),
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
  {
    input: 'lib/index.ts',
    external: makeExternalPredicate('browser'),
    plugins: getPlugins('browser'),
    output: [
      {
        format: 'esm',
        dir: 'build/esm/browser',
        exports: 'named',
        sourcemap: true,
        preserveModules: true,
      },
      // not emit test bundle for development
      (process.env.NODE_ENV !== 'development' && {
        // generate ems bundle for jest test, ".mjs" extension should be used
        // this bundle is excluded from the release package
        format: 'esm',
        file: 'build/bundles-for-validation/esm/esm.browser.mjs',
        exports: 'named',
        sourcemap: true
      })
    ]
  },
  {
    input: 'lib/index.ts',
    external: makeExternalPredicate('node'),
    plugins: getPlugins('node'),
    output: [
      {
        format: 'esm',
        dir: 'build/esm/node',
        exports: 'named',
        sourcemap: true,
        preserveModules: true,
      }
    ]
  }
];