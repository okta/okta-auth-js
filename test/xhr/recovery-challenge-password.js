module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-07-20T17:51:52.000Z",
    "factorType": "SMS",
    "status": "RECOVERY_CHALLENGE",
    "recoveryType": "PASSWORD",
    "_links": {
      "next": {
        "name": "verify",
        "href": "<%= uri %>/api/v1/authn/recovery/factors/SMS/verify",
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
      "resend": {
        "name": "sms",
        "href": "<%= uri %>/api/v1/authn/recovery/factors/SMS/resend",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
};
