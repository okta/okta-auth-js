module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ",
    "expiresAt": "2014-11-03T00:46:09.700Z",
    "status": "MFA_ENROLL_ACTIVATE",
    "relayState": "/myapp/some/deep/link/i/want/to/return/to",
    "factorResult": "TIMEOUT",
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
      },
      "factor": {
        "id": "opfh52xcuft3J4uZc0g3",
        "factorType": "push",
        "provider": "OKTA",
        "profile": {

        }
      }
    },
    "_links": {
      "next": {
        "name": "activate",
        "href": "<%= uri %>/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate",
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
      },
      "prev": {
        "href": "<%= uri %>/api/v1/authn/previous",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
};
