module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "status": "LOCKED_OUT",
    "_embedded": {},
    "_links": {
      "next": {
        "name": "unlock",
        "href": "<%= uri %>/api/v1/authn/recovery/unlock",
        "hints": {
          "allow": ["POST"]
        }
      },
      "cancel": {
        "href": "<%= uri %>/api/v1/authn/cancel",
        "hints": {
          "allow": ["POST"]
        }
      }
    }
  }
};
