module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00Ehr_AX8eU6E0LTLaa1uCWUmM2cMUa-2WVNxfnyyg",
    "expiresAt": "2014-11-03T04:57:56.038Z",
    "status": "PASSWORD_RESET",
    "relayState": "/myapp/some/deep/link/i/want/to/return/to",
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
        "name": "resetPassword",
        "href": "<%= uri %>/api/v1/authn/credentials/reset_password",
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
