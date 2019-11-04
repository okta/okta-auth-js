module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "expiresAt": "2014-11-10T04:06:58.000Z",
    "status": "RECOVERY",
    "relayState": "/myapp/some/deep/link/i/want/to/return/to",
    "recoveryToken": "VBQ0gwBp5LyJJFdbmWCM",
    "_embedded": {
      "user": {
        "id": "00ub0oNGTSWTBKOLGLNR",
        "profile": {
          "login": "isaac@example.org",
          "firstName": "Isaac",
          "lastName": "Brock",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      }
    },
    "_links": {
      "next": {
        "name": "recovery",
        "href": "<%= uri %>/api/v1/authn/recovery/token",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "cancel": {
        "href": "<%= uri %>/api/v1/authn/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
};
