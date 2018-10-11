module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ",
    "expiresAt": "2014-11-03T00:46:09.700Z",
    "status": "MFA_ENROLL_ACTIVATE",
    "relayState": "/myapp/some/deep/link/i/want/to/return/to",
    "factorResult": "WAITING",
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

        },
        "_embedded": {
          "activation": {
            "expiresAt": "2015-04-01T15:57:32.000Z",
            "_links": {
              "qrcode": {
                "href": "<%= uri %>/api/v1/users/00ugti3kwafWJBRIY0g3/factors/opfh52xcuft3J4uZc0g3/qr/00fukNElRS_Tz6k-CFhg3pH4KO2dj2guhmaapXWbc4",
                "type": "image/png"
              },
              "send": [{
                "name": "email",
                "href": "<%= uri %>/api/v1/users/00u15s1KDETTQMQYABRL/factors/mbl1nz9JHJGHWRKMTLHP/lifecycle/activate/email",
                "hints": {
                  "allow": [
                    "POST"
                  ]
                }
              }, {
                "name": "sms",
                "href": "<%= uri %>/api/v1/users/00u15s1KDETTQMQYABRL/factors/mbl1nz9JHJGHWRKMTLHP/lifecycle/activate/sms",
                "hints": {
                  "allow": [
                    "POST"
                  ]
                }
              }]
            }
          }
        }
      }
    },
    "_links": {
      "next": {
        "name": "poll",
        "href": "<%= uri %>/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll",
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
