module.exports = {
  "status": 403,
  "responseType": "json",
  "headers": {
    "WWW-Authenticate": "Bearer error=\"insufficient_scope\", error_description=\"The access token must provide access to at least one of these scopes - profile, email, address or phone\""
  },
  "response": {}
};
