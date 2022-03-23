export const getUrl = (oktaAuth, url) => 
  // `${oktaAuth.options.issuer}${url}`;
  // current myaccount endpoints have cors issue for browser request
  // use proxy before fix is released in prod
  `/myaccount${url}` 
