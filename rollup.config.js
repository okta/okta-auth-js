import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import cleanup from 'rollup-plugin-cleanup';
import typescript from 'rollup-plugin-typescript2';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import license from 'rollup-plugin-license';
import multiInput from 'rollup-plugin-multi-input';
import { visualizer } from 'rollup-plugin-visualizer';
import resolve from '@rollup/plugin-node-resolve';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import pkg from './package.json';

const path = require('path');

let platforms = ['browser', 'node'];
let entries = {
  'worker': 'lib/workers/TimerWorker.worker.ts',
  'okta-auth-js': 'lib/exports/default.ts',
  'core': 'lib/exports/core.ts',
  'authn': 'lib/exports/authn.ts',
  'idx': 'lib/exports/idx.ts',
  'myaccount': 'lib/exports/myaccount.ts',
};
let preserveModules = true;
const combinedOutputDir = true; // all entries share an output dir
function getOuptutDir(entryName, env) {
  return combinedOutputDir ? `build/esm/${env}` : `build/esm/${entryName}/${env}`;
}

// if ENTRY env var is passed, filter the entries to include only the named ENTRY
if (process.env.ENTRY) {
  entries = {
    [process.env.ENTRY]: entries[process.env.ENTRY]
  };
}

// if PLATFORM env var is passed, filter the platforms to include only the named PLATFORM
if (process.env.PLATFORM) {
  platforms = platforms.filter(platform => platform === process.env.PLATFORM);
}

// if ANALZYE env var is passed, output analyzer html (must output single bundle)
if (process.env.ANALYZE) {
  preserveModules = false;
}

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
  preserveModules,
  // not using .mjs extension because it causes issues with Vite
  // entryFileNames: '[name].mjs'
};

function createPackageJson(dirName) {
  return {
    name: 'create-package-json',
    generateBundle() {
      // Add an extra package.json underneath ESM to indicate module type
      // This helps tools like Jest identify this code as ESM
      if (!existsSync(dirName)){
        mkdirSync(dirName, { recursive: true });
      }
      writeFileSync(`${dirName}/package.json`, JSON.stringify({
        name: pkg.name,
        version: pkg.version,
        type: 'module'
      }, null, 4));
    }
  };
}

const getPlugins = (env, entryName) => {
  const outputDir = getOuptutDir(entryName, env);
  let plugins = [
    replace({
      'SDK_VERSION': JSON.stringify(pkg.version),
      'BUNDLER': JSON.stringify('rollup'),
      'global.': 'window.',
      preventAssignment: true
    }),
    (env === 'browser' && alias({
      entries: [
        { find: /.\/node$/, replacement: './browser' }
      ]
    })),
    entryName === 'worker' && {
      name: 'worker-to-string',
      renderChunk(code) {
        return `export default \`${code}\`;`;
      },
    },
    typescript({
      // eslint-disable-next-line node/no-unpublished-require
      typescript: require('typescript'),
      tsconfigOverride: {
        compilerOptions: {
          sourceMap: true,
          target: entryName === 'worker' ? 'ES3' : 'ES2017', // skip async/await transpile,
          module: 'ES2020', // support dynamic import
          declaration: false
        }
      }
    }),
    entryName === 'worker' && resolve(),
    cleanup({
      extensions,
      comments: 'none'
    }),
    license({
      banner: {
        content: {
          file: path.join(__dirname, 'scripts', 'buildtools', 'license-template'),
        }
      }
    }),
    replace({
      'TimerWorker.workerSource.js': 'TimerWorker.worker.js',
      preventAssignment: true
    }),
    multiInput({ 
      relative: 'lib/',
    }),
    createPackageJson(outputDir),
  ];

  // if ANALZYE env var is passed, output analyzer html
  if (process.env.ANALYZE) {
    plugins = plugins.concat([
      visualizer({
        sourcemap: true,
        projectRoot: path.join(__dirname, './lib'),
        filename: `./build/esm/${entryName}.${env}.analzyer.html`,
        template: 'treemap' // sunburst | treemap | network
      }),
    ]);
  }
  return plugins;
};


export default Object.keys(entries).reduce((res, entryName) => {
  const entryValue = entries[entryName];
  return res.concat(platforms.map((type) => {
    return ({
      input: Array.isArray(entryValue) ? entryValue : [entryValue],
      external: makeExternalPredicate(type),
      plugins: getPlugins(type, entryName),
      output: [
        {
          ...output,
          dir: getOuptutDir(entryName, type),
          ...(entryName === 'worker' ? {
            plugins: [
              getBabelOutputPlugin({
                presets: [
                  '@babel/preset-env',
                ],
              })
            ],
            preserveModules: false,
            sourcemap: false, // sourcemaps do not work with `worker-to-string` plugin
            exports: 'none',
          } : {
          })
        }
      ]
    });
  }));
}, []);
