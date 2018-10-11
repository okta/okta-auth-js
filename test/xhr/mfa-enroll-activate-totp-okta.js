module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00wlafXU2GV9I3tNvDNkOA1thqM5gDwCOgHID_-Iej",
    "expiresAt": "2014-11-03T00:50:49.912Z",
    "status": "MFA_ENROLL_ACTIVATE",
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
      },
      "factor": {
        "id": "ostf2xjtDKWFPZIKYDZV",
        "factorType": "token:software:totp",
        "provider": "OKTA",
        "profile": {
          "credentialId": "isaac@example.org"
        },
        "_embedded": {
          "activation": {
            "timeStep": 30,
            "sharedSecret": "KBMTM32UJZSXQ2DW",
            "encoding": "base32",
            "keyLength": 6,
            "_links": {
              "qrcode": {
                "href": "https://your-domain.okta.com/api/v1/users/00uoy3CXZHSMMJPHYXXP/factors/ostf2xjtDKWFPZIKYDZV/qr/00Mb0zqhJQohwCDkB2wOifajAsAosEAXvDwuCmsAZs",
                "type": "image/png"
              }
            }
          }
        }
      }
    },
    "_links": {
      "next": {
        "name": "activate",
        "href": "https://your-domain.okta.com/api/v1/authn/factors/ostf2xjtDKWFPZIKYDZV/lifecycle/activate",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "cancel": {
        "href": "https://your-domain.okta.com/api/v1/authn/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "prev": {
        "href": "https://your-domain.okta.com/api/v1/authn/previous",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
};
