module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00rt1IY9c6Q3RVc4a2jJPbS2uAtFNWJz_d8A26KTdF",
    "expiresAt": "2015-08-21T19:54:48.486Z",
    "status": "MFA_CHALLENGE",
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
      "factor": {
        "id": "smsigwDlH85L9FyQK0g3",
        "factorType": "sms",
        "provider": "OKTA",
        "profile": {
          "phoneNumber": "+1 XXX-XXX-6688"
        },
        "_embedded": {
          "verification": null
        }
      }
    },
    "_links": {
      "next": {
        "name": "verify",
        "href": "<%= uri %>/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify",
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
      },
      "resend": [{
        "name": "sms",
        "href": "<%= uri %>/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify/resend",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }]
    }
  }
};
