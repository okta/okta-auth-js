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
   // cookieDomainRewrite: 'localhost',
   // selfHandleResponse: true, 
    onProxyRes: (proxyRes, req, res) => {
      if (req.url.includes('/oauth2/v1/authorize')) {
        console.log('-------------')
        console.log('-------------')
        console.log('-------------')
        const cs = proxyRes.headers['set-cookie'];
        const cs2 = [];
        for (const c of cs) {
          let c2 = c;
          c2 = c2.replace('; Secure', '');
          c2 = c2 + '; Domain=javascript-idx-sdk.okta.com';
          cs2.push(c2);
        }
        console.log(cs2)
        proxyRes.headers['set-cookie'] = cs2;
      }
    },
    // onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    //   const response = responseBuffer.toString('utf8');
    //   let patchedResponse = response;
    //   // patchedResponse = patchedResponse.replace(
    //   //   buildRegexForUri(origin),
    //   //   escapeUri(`http://localhost:${proxyPort}`)
    //   // );
    //   // if (!req.url.includes('/.well-known') ) {
    //   //   patchedResponse = patchedResponse.replace(
    //   //     new RegExp(origin, 'g'),
    //   //     `http://localhost:${proxyPort}`
    //   //   );
    //   // }
    //   if (req.url.includes('/oauth2/v1/authorize')) {
    //     console.log('-------------')
    //     console.log('-------------')
    //     console.log('-------------')
    //     const cs = proxyRes.headers['set-cookie'];
    //     const cs2 = [];
    //     for (const c of cs) {
    //       let c2 = c;
    //       c2 = c2.replace('; Secure', '');
    //       c2 = c2 + '; Domain=javascript-idx-sdk.okta.com';
    //       cs2.push(c2);
    //     }
    //     console.log(cs2)
    //     proxyRes.headers['set-cookie'] = cs2;
    //   }
    //   return patchedResponse;
    // }),
  });
};
