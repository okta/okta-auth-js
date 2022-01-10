import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import cleanup from 'rollup-plugin-cleanup';
import typescript from 'rollup-plugin-typescript2';
import license from 'rollup-plugin-license';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const path = require('path');

const makeExternalPredicate = () => {
  const externalArr = [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ];

  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

const extensions = ['js', 'ts'];

const external = makeExternalPredicate();
const commonPlugins = [
  commonjs({
    extensions
  }),
  replace({
    'SDK_VERSION': JSON.stringify(pkg.version),
    'global.': 'window.',
    preventAssignment: true
  }),
  typescript({
    // eslint-disable-next-line node/no-unpublished-require
    typescript: require('typescript'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: true,
        target: 'ES2017', // skip async/await transpile
        declaration: false,
        allowSyntheticDefaultImports: true
      }
    }
  }),
  babel({
    babelHelpers: 'runtime',
    presets: [
      '@babel/preset-env'
      
    ],
    plugins: [
      '@babel/plugin-transform-runtime'
    ],
    extensions
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

export default [
  {
    input: 'lib/index.ts',
    external,
    plugins: [
      alias({
        entries: [
          { find: /.\/node$/, replacement: './browser' }
        ]
      }),
      ...commonPlugins
    ],
    output: [
      {
        format: 'esm',
        file: 'build/esm/browser.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  },
  // {
  //   input: 'lib/index.ts',
  //   external,
  //   plugins: commonPlugins,
  //   output: [
  //     {
  //       format: 'esm',
  //       file: 'build/esm/node.js',
  //       exports: 'named',
  //       sourcemap: true
  //     }
  //   ]
  // }
];