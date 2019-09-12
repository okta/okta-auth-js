module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00lMJySRYNz3u_rKQrsLvLrzxiARgivP8FB_1gpmVb",
    "expiresAt": "2014-11-03T04:35:20.748Z",
    "status": "RECOVERY",
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
        },
        "recovery_question": {
          "question": "Who's a major player in the cowboy scene?"
        }
      }
    },
    "_links": {
      "next": {
        "name": "answer",
        "href": "<%= uri %>/api/v1/authn/recovery/answer",
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
