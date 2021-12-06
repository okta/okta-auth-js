# Tree shaking test app

This app leverages webpack + webpack bundle analyzer to help debug how ES module tree shaking can be supported in okta-auth-js SDK.

## Start debugging

1. Start the webpack bundle analyzer in watch mode.
    ```bash
    yarn workspace @okta/tree-shaking start
    ```

2. Start `build:esm` task in another terminal session.
    ```bash
    yarn build:esm --watch
    ```

3. Debug with `src/index.js` code change to import/use different SDK submodules, then check bundle analyzer graph.

4. Debug with SDK code change, then check bundle analyzer graph.
