@okta/test.apps.verify-entries

Test app to verify bundle size from different entries

## How it works

The base of this app is generated with `vite` (vanilla ts) to provide a quick way to bundle SPA with different @okta/okta-auth-js entries, like idx, authn. 

Each entry is imported from a minimum `{entryName}.ts` file under `src` dir, which is included in `{entryName}.html` to build the SPA bundle. By running `yarn build:{entryName}` script, a `stats.{entry}.html` will be generated under `dist` dir to visualize and analyze your entry specific SPA bundle.

## Scripts

### Under root dir of monorepo

```sh
yarn workspace @okta/test.apps.verify-entries build:{entry}
```

### Under test app dir

```sh
yarn build:{entry}
```
