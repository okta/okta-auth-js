/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


module.exports = {
    "status": 200,
    "responseType": "json",
    "response": {
        "stateToken": "01Z20ZhXVrmyR3z8R-m77BvknHyckWCy5vNwEA6huD",
        "expiresAt": "2014-11-02T23:44:41.736Z",
        "status": "FACTOR_ENROLL",
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
            "factors": [{
                "factorType": "question",
                "provider": "OKTA",
                "_links": {
                    "questions": {
                        "href": "<%= uri %>/api/v1/users/00uoy3CXZHSMMJPHYXXP/factors/questions",
                        "hints": {
                            "allow": [
                                "GET"
                            ]
                        }
                    },
                    "enroll": {
                        "href": "<%= uri %>/api/v1/authn/factors",
                        "hints": {
                            "allow": [
                                "POST"
                            ]
                        }
                    }
                }
            }, {
                "factorType": "token",
                "provider": "RSA",
                "_links": {
                    "enroll": {
                        "href": "<%= uri %>/api/v1/authn/factors",
                        "hints": {
                            "allow": [
                                "POST"
                            ]
                        }
                    }
                }
            }, {
                "factorType": "token:software:totp",
                "provider": "GOOGLE",
                "_links": {
                    "enroll": {
                        "href": "<%= uri %>/api/v1/authn/factors",
                        "hints": {
                            "allow": [
                                "POST"
                            ]
                        }
                    }
                }
            }, {
                "factorType": "token:software:totp",
                "provider": "OKTA",
                "_links": {
                    "enroll": {
                        "href": "<%= uri %>/api/v1/authn/factors",
                        "hints": {
                            "allow": [
                                "POST"
                            ]
                        }
                    }
                }
            }, {
                "factorType": "sms",
                "provider": "OKTA",
                "_links": {
                    "enroll": {
                        "href": "<%= uri %>/api/v1/authn/factors",
                        "hints": {
                            "allow": [
                                "POST"
                            ]
                        }
                    }
                }
            }, {
                "factorType": "push",
                "provider": "OKTA",
                "_links": {
                    "enroll": {
                        "href": "<%= uri %>/api/v1/authn/factors",
                        "hints": {
                            "allow": [
                                "POST"
                            ]
                        }
                    }
                }
            }]
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
