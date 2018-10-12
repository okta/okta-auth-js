module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "id": "000SFn2Do5LSEeE7ETg1JewvQ",
    "userId": "00uih5GNExguYaK6I0g3",
    "login": "administrator1@clouditude.net",
    "expiresAt": "2016-01-27T03:59:35.000Z",
    "status": "ACTIVE",
    "lastPasswordVerification": "2016-01-27T01:15:39.000Z",
    "lastFactorVerification": null,
    "amr": ["pwd"],
    "idp": {
      "id": "00oigpTeBgc5cgQh50g3",
      "type": "OKTA"
    },
    "mfaActive": false,
    "_links": {
      "self": {
        "href": "<%= uri %>/api/v1/sessions/000SFn2Do5LSEeE7ETg1JewvQ",
        "hints": {
          "allow": ["GET", "DELETE"]
        }
      },
      "refresh": {
        "href": "<%= uri %>/api/v1/sessions/000SFn2Do5LSEeE7ETg1JewvQ/lifecycle/refresh",
        "hints": {
          "allow": ["POST"]
        }
      },
      "user": {
        "name": "Add-Min O'Cloudy Tud",
        "href": "<%= uri %>/api/v1/users/me",
        "hints": {
          "allow": ["GET", "POST"]
        }
      }
    }
  }
};
