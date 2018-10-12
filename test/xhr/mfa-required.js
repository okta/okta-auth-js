module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP",
    "expiresAt": "2015-08-21T00:11:36.846Z",
    "status": "MFA_REQUIRED",
    "relayState": "",
    "_embedded": {
      "user": {
        "id": "00ui35LSniskDQCfg0g3",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      },
      "factors": [
        {
          "id": "ufsigasO4dVUPM5O40g3",
          "factorType": "question",
          "provider": "OKTA",
          "profile": {
            "question": "disliked_food",
            "questionText": "What is the food you least liked as a child?"
          },
          "_links": {
            "verify": {
              "href": "<%= uri %>/api/v1/authn/factors/ufsigasO4dVUPM5O40g3/verify",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        },
        {
          "id": "uftigiEmYTPOmvqTS0g3",
          "factorType": "token:software:totp",
          "provider": "GOOGLE",
          "profile": {
            "credentialId": "administrator1@clouditude.net"
          },
          "_links": {
            "verify": {
              "href": "<%= uri %>/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        },
        {
          "id": "ostigevBq2NObXmTh0g3",
          "factorType": "token:software:totp",
          "provider": "OKTA",
          "profile": {
            "credentialId": "administrator1@clouditude.net"
          },
          "_links": {
            "verify": {
              "href": "<%= uri %>/api/v1/authn/factors/ostigevBq2NObXmTh0g3/verify",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        },
        {
          "id": "opfhw7v2OnxKpftO40g3",
          "factorType": "push",
          "provider": "OKTA",
          "profile": {
            "credentialId": "administrator1@clouditude.net",
            "deviceType": "SmartPhone_IPhone",
            "keys": [
              {
                "kty": "PKIX",
                "use": "sig",
                "kid": "default",
                "x5c": [
                  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs4LfXaaQW6uIpkjoiKn2g9B6nNQDraLyC3XgHP5cvX/qaqry43SwyqjbQtwRkScosDHl59r0DX1V/3xBtBYwdo8rAdX3I5h6z8lW12xGjOkmb20TuAiy8wSmzchdm52kWodUb7OkMk6CgRJRSDVbC97eNcfKk0wmpxnCJWhC+AiSzRVmgkpgp8NanuMcpI/X+W5qeqWO0w3DGzv43FkrYtfSkvpDdO4EvDL8bWX1Ad7mBoNVLWErcNf/uI+r/jFpKHgjvx3iqs2Q7vcfY706Py1m91vT0vs4SWXwzVV6pAVjD/kumL+nXfzfzAHw+A2vb6J2w06Rj71bqUkC2b8TpQIDAQAB"
                ]
              }
            ],
            "name": "Reman's iPhone",
            "platform": "IOS",
            "version": "8.1.3"
          },
          "_links": {
            "verify": {
              "href": "<%= uri %>/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        },
        {
          "id": "smsigwDlH85L9FyQK0g3",
          "factorType": "sms",
          "provider": "OKTA",
          "profile": {
            "phoneNumber": "+1 XXX-XXX-6688"
          },
          "_links": {
            "verify": {
              "href": "<%= uri %>/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        }
      ]
    },
    "_links": {
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
