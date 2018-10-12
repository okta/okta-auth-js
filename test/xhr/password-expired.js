module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00s1pd3bZuOv-meJE13hz1B7SZl5EGc14Ii_CTBIYd",
    "expiresAt": "2014-11-02T23:39:03.319Z",
    "status": "PASSWORD_EXPIRED",
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
        "name": "changePassword",
        "href": "<%= uri %>/api/v1/authn/credentials/change_password",
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
