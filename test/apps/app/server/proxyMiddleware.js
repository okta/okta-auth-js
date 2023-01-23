const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

// Explanation for need of response rewrites in `onProxyRes`:
//
// HTML page `<proxy>/oauth2/v1/authorize` contains script with config for SIW with var `baseUrl`.
// `baseUrl` value equals to <origin>, it is used for IDX API requests.
// Need to replace <origin> to <proxy> in `baseUrl`.
// Otherwise response to `<origin>/idp/idx/identify` after successful login would contain redirect URL
//  `<origin>/login/token/redirect?stateToken=xxx` which would render HTTP 403 error.
// The problem relates to `DT` cookie which is set on page `<proxy>/oauth2/v1/authorize`
//  for domain <proxy>, but not <origin>.
// Since cookie for <origin> domain can't be set from <proxy> server response (unless they are in same domain)
//  and there is no way to configure value of `baseUrl`, it should be intercepted and replaced in a response.
//
// <origin> should be replaced to <proxy> in IDX API responses, but not for `/.well-known`.
// Otherwise `handleRedirect` will produce error `AuthSdkError: The issuer [origin] does not match [proxy]`

function escapeUri(str) {
  return [
    [':', '\\x3A'],
    ['/', '\\x2F'],
    ['-', '\\x2D']
  ].reduce((str, [from, to]) => str.replace(new RegExp(from, 'g'), to), str);
}

function buildRegexForUri(str) {
  return new RegExp(escapeUri(str).replace(/\\/g, '\\\\'), 'g');
}

module.exports = function proxyMiddlewareFactory({ proxyPort, origin }) {
  return createProxyMiddleware({
    target: origin,
    secure: false,
    changeOrigin: true,
    selfHandleResponse: true, 
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      const response = responseBuffer.toString('utf8');
      let patchedResponse = response;
      if (req.url.includes('/oauth2/v1/authorize') ) {
        patchedResponse = patchedResponse.replace(
          buildRegexForUri(origin),
          escapeUri(`http://localhost:${proxyPort}`)
        );
      }
      if (req.url.includes('/idp/idx/') ) {
        patchedResponse = patchedResponse.replace(
          new RegExp(origin, 'g'),
          `http://localhost:${proxyPort}`
        );
      }
      return patchedResponse;
    }),
  });
};
