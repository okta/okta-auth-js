module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:node/recommended-script",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsdoc/recommended"
  ],
  env: {
    browser: false,
    commonjs: true,
    node: true
  },
  globals: {
    Promise: true,
    console: true,
    setTimeout: true,
    clearTimeout: true,
    setInterval: true,
    clearInterval: true
  },
  settings: {
    jsdoc: {
      mode: "typescript",
      definedTags: [
        "type"
      ]
    }
  },
  overrides: [
    {
      files: ["*.ts"],
      plugins: [
        "@typescript-eslint"
      ],
      parser: "@typescript-eslint/parser",
      rules: {
        // https://typescript-eslint.io/docs/linting/troubleshooting/#i-am-using-a-rule-from-eslint-core-and-it-doesnt-work-correctly-with-typescript-code
        "no-undef": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
      }
    },
    {
      files: ["samples/generated/**/*"],
      rules: {
        "@typescript-eslint/ban-ts-comment": "off"
      }
    },
    {
      files: ["polyfill/**/*", "build/polyfill/**/*"],
      env: {
        browser: true
      },
      rules: {
        "node/no-unsupported-features/node-builtins": ["error", {
          ignores: ["TextEncoder", "TextDecoder"]
        }]
      }
    },
    {
      files: ["test/types/*.ts"],
      env: {
        browser: true,
        node: true
      },
      rules: {
        "node/no-unsupported-features/es-syntax": 0,
        "node/no-extraneous-import": 0,
        "no-unused-vars": 0,
        "@typescript-eslint/no-unused-vars": 0,
        "max-statements": 0
      }
    },
    {
      files: ["build/**/*.js"],
      rules: {
        "node/no-unpublished-require": 1,
        "node/no-unpublished-import": 1
      }
    },
    {
      files: ["{lib,build/lib}/{browser/*,crypto,oidc/util/pkce}.{js,ts}"],
      rules: {
        "node/no-unsupported-features/node-builtins": ["error", {
          ignores: ["TextEncoder"]
        }]
      }
    },
    {
      files: [
        "lib/**/*"
      ],
      plugins: [
        "@typescript-eslint",
        "jsdoc",
        // https://github.com/import-js/eslint-plugin-import#typescript
        'import',
      ],
      extends: [
        'plugin:import/recommended',
        'plugin:import/typescript'
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: "./"
      },
      rules: {
        "node/no-missing-import": ["error", {
          allowModules: [
            "@okta/okta-auth-js"
          ],
          tryExtensions: [".js", ".ts"]
        }],
        // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
        'import/no-extraneous-dependencies': ['error', {
          'devDependencies': false
        }],
        'node/no-unsupported-features/es-builtins': ['error', {
          // features that are not supported before v12 are transformed in babel.cjs.js for commonjs output
          version: '>=12.0.0'
        }],
        'import/no-commonjs': 'error',
        "jsdoc/check-tag-names": 0
      },
      settings: {
        // https://github.com/import-js/eslint-plugin-import#typescript
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts']
        }
      },
    },
    {
      files: ["rollup.config.js"],
      rules: {
        "node/no-unsupported-features/es-syntax": 0
      }
    }
  ],
  rules: {
    "no-var": 0,
    "prefer-rest-params": 0,
    "prefer-spread": 0,
    "prefer-const": 0,
    "node/no-unpublished-require": 0,
    "node/no-unpublished-import": 0,
    camelcase: 2,
    complexity: [2, 7],
    curly: 2,
    "dot-notation": 0,
    "guard-for-in": 2,
    "new-cap": [2, { properties: false }],
    "no-caller": 2,
    "no-empty": 2,
    "no-eval": 2,
    "no-implied-eval": 2,
    "no-multi-str": 0,
    "no-new": 2,
    "no-plusplus": 0,
    "no-undef": 2,
    "no-use-before-define": [2, "nofunc"],
    "no-unused-expressions": [2, { allowShortCircuit: true, allowTernary: true }],
    "no-unused-vars": 2,
    "max-depth": [2, 3],
    "max-len": [2, 120],
    "max-params": [2, 5],
    "max-statements": [2, 25],
    quotes: [2, "single", { allowTemplateLiterals: true }],
    semi: 2,
    strict: 0,
    "wrap-iife": [2, "any"],
    "no-throw-literal": 2,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/no-this-alias": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/ban-ts-ignore": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/triple-slash-reference": 0,
    "jsdoc/require-jsdoc": 0,
    "jsdoc/require-param": 0,
    "jsdoc/require-returns-description": 0,
    "jsdoc/require-param-description": 0,
    "jsdoc/require-returns": 0,
    "jsdoc/no-undefined-types": 0,
    "node/no-extraneous-require": ["error", {
      allowModules: [
        "@okta/okta-auth-js",
        "@okta/env"
      ]
    }]
  },
  root: true
}
