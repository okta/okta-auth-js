module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "id": "00uih5GNExguYaK6I0g3",
    "status": "ACTIVE",
    "created": "2016-01-26T18:12:29.000Z",
    "activated": null,
    "statusChanged": null,
    "lastLogin": "2016-01-27T18:16:38.000Z",
    "lastUpdated": "2016-01-26T18:13:00.000Z",
    "passwordChanged": "2016-01-26T18:13:00.000Z",
    "profile": {
      "mobilePhone": null,
      "email": "webmaster@clouditude.net",
      "secondEmail": null,
      "login": "administrator1@clouditude.net",
      "firstName": "Add-Min",
      "lastName": "O'Cloudy Tud"
    },
    "credentials": {
      "password": {},
      "recovery_question": {
        "question": "Last 4 digits of your social security number?"
      },
      "provider": {
        "type": "OKTA",
        "name": "OKTA"
      }
    },
    "_links": {
      "resetPassword": {
        "href": "<%= uri %>/api/v1/users/00uih5GNExguYaK6I0g3/lifecycle/reset_password",
        "method": "POST"
      },
      "expirePassword": {
        "href": "<%= uri %>/api/v1/users/00uih5GNExguYaK6I0g3/lifecycle/expire_password",
        "method": "POST"
      },
      "forgotPassword": {
        "href": "<%= uri %>/api/v1/users/00uih5GNExguYaK6I0g3/credentials/forgot_password",
        "method": "POST"
      },
      "changeRecoveryQuestion": {
        "href": "<%= uri %>/api/v1/users/00uih5GNExguYaK6I0g3/credentials/change_recovery_question",
        "method": "POST"
      },
      "deactivate": {
        "href": "<%= uri %>/api/v1/users/00uih5GNExguYaK6I0g3/lifecycle/deactivate",
        "method": "POST"
      },
      "changePassword": {
        "href": "<%= uri %>/api/v1/users/00uih5GNExguYaK6I0g3/credentials/change_password",
        "method": "POST"
      }
    }
  }
};
