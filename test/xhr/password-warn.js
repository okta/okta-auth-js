module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s",
    "expiresAt": "2015-11-10T22:08:57.691Z",
    "status": "PASSWORD_WARN",
    "_embedded": {
      "user": {
        "id": "00uia0N87NVFAcLjm0g3",
        "passwordChanged": "2015-11-10T21:50:43.000Z",
        "profile": {
          "login": "inca@clouditude.net",
          "firstName": "Inca-Louise",
          "lastName": "O'Rain Dum",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      },
      "policy": {
        "expiration": {
          "passwordExpireDays": 0
        },
        "complexity": {
          "minLength": 8,
          "minLowerCase": 1,
          "minUpperCase": 1,
          "minNumber": 1,
          "minSymbol": 0
        }
      }
    },
    "_links": {
      "next": {
        "name": "changePassword",
        "href": "<%= uri %>/api/v1/authn/credentials/change_password",
        "hints": {
          "allow": ["POST"]
        }
      },
      "skip": {
        "name": "skip",
        "href": "<%= uri %>/api/v1/authn/skip",
        "hints": {
          "allow": ["POST"]
        }
      },
      "cancel": {
        "href": "<%= uri %>/api/v1/authn/cancel",
        "hints": {
          "allow": ["POST"]
        }
      }
    }
  }
};
