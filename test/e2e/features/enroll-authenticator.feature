Feature: Enroll Authenticator via Authorize Endpoint

Background:
  Given an App that assigned to a test group
    And a Policy that defines "Authentication"
     And with a Policy Rule that defines "Password as the only factor"
    And a Policy that defines "Profile Enrollment"
     And with a Policy Rule that defines "collecting default attributes and emailVerification is not required"
    And a Policy that defines "MFA Enrollment" with properties
     | okta_password      | REQUIRED |
     | okta_email         | REQUIRED |
     | phone_number       | OPTIONAL |
     | security_question  | OPTIONAL |
     And with a Policy Rule that defines "MFA Enrollment Challenge"
    And a user named "Mary"
     And she has an account with "active" state in the org
     And she has enrolled in the "SMS" factor

Scenario: Mary Enrolls into Security Question
  Given Mary is on the default view in an UNAUTHENTICATED state
    And she is not enrolled in the "question" factors
  When she enters "kba" into "Enroll AMR values"
    And she selects "urn:okta:loa:2fa:any:ifpossible" into "ACR values"
    And she clicks the "Update Config" button
  Then she sees "kba" in "Enroll AMR values"
  Then she sees "urn:okta:loa:2fa:any:ifpossible" in "ACR values"
  When she clicks the "Enroll Authenticator" button
  Then the app should construct an authorize request with params
     | prompt            | enroll_authenticator            |
     | acr_values        | urn:okta:loa:2fa:any:ifpossible |
     | enroll_amr_values | kba                             |
     | response_type     | none                            |
     | max_age           | 0                               |
  And she should be redirected to the Okta Sign In Widget
  When she inputs her username and password in widget
  Then she should be challenged to verify her "sms"
  When she verifies her sms
  Then she is required to set up authenticator "Security Question"
  When she creates security question answer
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is handled with message "Authenticator enrollment completed"
  When she returns home
  Then she is redirected to the default view in an UNAUTHENTICATED state
    And she is enrolled in the "question" factors
