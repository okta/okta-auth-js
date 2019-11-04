module.exports = {
    "status": 200,
    "responseType": "json",
    "response": {
        "stateToken": "01lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ",
        "expiresAt": "2014-11-03T00:46:09.700Z",
        "status": "FACTOR_ENROLL_ACTIVATE",
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
                "id": "mbl198rKSEWOSKRIVIFT",
                "factorType": "sms",
                "provider": "OKTA",
                "profile": {
                    "phoneNumber": "+1 XXX-XXX-1337"
                }
            }
        },
        "_links": {
            "next": {
                "name": "activate",
                "href": "<%= uri %>/api/v1/authn/factors/mbl198rKSEWOSKRIVIFT/lifecycle/activate",
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
                "href": "<%= uri %>/api/v1/authn/factors/mbl198rKSEWOSKRIVIFT/lifecycle/resend",
                "hints": {
                    "allow": [
                        "POST"
                    ]
                }
            }]
        }
    }
};
