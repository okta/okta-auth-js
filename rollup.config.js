import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import cleanup from 'rollup-plugin-cleanup';
import typescript from 'rollup-plugin-typescript2';
import pkg from "./package.json";

const makeExternalPredicate = () => {
  const externalArr = [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ];

  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return id => pattern.test(id);
};

const extensions = ['js', 'ts'];

const external = makeExternalPredicate();
const commonPlugins = [
  alias({
    entries: [
      { find: /.\/node$/, replacement: './browser' }
    ]
  }),
  typescript({
    // eslint-disable-next-line node/no-unpublished-require
    typescript: require('typescript'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: true,
        target: 'ES2017', // skip async/await transpile
        declaration: false
      }
    }
  }),
  replace({
    'SDK_VERSION': JSON.stringify(pkg.version),
    preventAssignment: true
  }),
  cleanup({ 
    extensions,
    comments: 'none'
  })
];

export default [
  {
    input: 'lib/index.ts',
    external,
    plugins: [
      ...commonPlugins,
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
    ],
    output: [
      {
        format: 'esm',
        file: 'build/esm/index.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  }
];