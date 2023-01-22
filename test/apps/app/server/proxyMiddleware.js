const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

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
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      const response = responseBuffer.toString('utf8');
      let patchedResponse = response;
      patchedResponse = patchedResponse.replace(
        buildRegexForUri(origin),
        escapeUri(`http://localhost:${proxyPort}`)
      );
      if (!req.url.includes('/.well-known') ) {
        patchedResponse = patchedResponse.replace(
          new RegExp(origin, 'g'),
          `http://localhost:${proxyPort}`
        );
      }
      return patchedResponse;
    }),
  });
};
