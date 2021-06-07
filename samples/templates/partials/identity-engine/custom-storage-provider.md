### Custom storage provider

As this sample app is implemented to support multiple users scenario, a custom storage provide will be needed to inject to the [authClient][Okta Auth JS] to proper store the transaction meta and tokens. In this sample, it leverages [express-session](https://www.npmjs.com/package/express-session) to store data based on the transactionId.

See implementation details in [getAuthClient.js](./web-server/utils/getAuthClient.js) and [Auth JS storageProvider](https://github.com/okta/okta-auth-js#storageprovider).
