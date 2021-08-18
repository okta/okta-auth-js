const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function proxyMiddlewareFactory(options) {
  const { origin } = new URL(process.env.ISSUER);
  return createProxyMiddleware(Object.assign({
    target: origin,
    secure: false,
    changeOrigin: true,
  }, options));
};
