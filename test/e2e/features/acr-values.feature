Feature: ACR Values

Background:
  Given an App that assigned to a test group
    And a Policy that defines "Authentication"
    And with a Policy Rule that defines "Password as the only factor"
    And a Policy that defines "MFA Enrollment" with properties
    | okta_password | REQUIRED |
    | okta_email    | REQUIRED |
    | phone_number  | OPTIONAL |
    And with a Policy Rule that defines "MFA Enrollment Challenge"
    And a user named "Mary"
    And she has an account with "active" state in the org
    And she has enrolled in the "SMS" factor

Scenario: Mary logs in with the initial App Authentication Policy
  Given Mary is on the default view in an UNAUTHENTICATED state
  When she clicks the "Login using REDIRECT" button
  Then the app should construct an authorize request for the protected action, not including an ACR Token in the request or an ACR value
   And she should be redirected to the Okta Sign In Widget
  When she inputs her username and password in widget
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is handled
  When she returns home
  Then she is redirected to the default view in an AUTHENTICATED state
   And she sees her ID and Access Tokens
  When she refreshes the page
  Then she sees the default view in an AUTHENTICATED state
    And she sees her ID and Access Tokens 

@smstest
Scenario: Mary logs in with an ACR value in the Authorize request
  Given Mary is on the default view in an UNAUTHENTICATED state
  When she selects "urn:okta:loa:2fa:any:ifpossible" into "ACR values"
    And she clicks the "Update Config" button
  Then she sees "urn:okta:loa:2fa:any:ifpossible" in "ACR values"
  When she clicks the "Login using REDIRECT" button
  Then the app should construct an authorize request for the protected action, not including an ACR Token in the request but including the ACR value
    And she should be redirected to the Okta Sign In Widget
  When she inputs her username and password in widget
  Then she should be challenged to verify her "sms"
  When she verifies her sms
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is handled
  When she returns home
  Then she is redirected to the default view in an AUTHENTICATED state
   And the app receives and additional token for this ACR value "urn:okta:loa:2fa:any:ifpossible"
   And the app stores this new token in Token Storage
   And she sees her ID and Access Tokens
  When she refreshes the page
  Then she sees the default view in an AUTHENTICATED state
    And she sees her ID and Access Tokens 

@smstest
Scenario: Mary is signed in without ACR, and is challenged with an ACR value
  # Authenticate using SIW
  Given Mary is on the default view in an UNAUTHENTICATED state
  When she clicks the "Login using REDIRECT" button
  Then the app should construct an authorize request for the protected action, not including an ACR Token in the request or an ACR value
   And she should be redirected to the Okta Sign In Widget
  When she inputs her username and password in widget
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is handled
  When she returns home
  Then she is redirected to the default view in an AUTHENTICATED state
  # Authenticate again with ACR values
  When she selects "urn:okta:loa:2fa:any" into "ACR values"
    And she clicks the "Update Config" button
  Then she sees "urn:okta:loa:2fa:any" in "ACR values"
  When she clicks the "Login with ACR" button
  Then the app should construct an authorize request for the protected action, not including an ACR Token in the request but including the ACR value
    And she should be redirected to the Okta Sign In Widget
    And she should be challenged to verify her "sms"
  When she verifies her sms
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is handled
  When she returns home
  Then she is redirected to the default view in an AUTHENTICATED state
   And the app receives and additional token for this ACR value "urn:okta:loa:2fa:any"
   And the app stores this new token in Token Storage
   And she sees her ID and Access Tokens
  When she refreshes the page
  Then she sees the default view in an AUTHENTICATED state
    And she sees her ID and Access Tokens 

@smstest
Scenario: Mary is signed in without ACR, and is challenged with an ACR value, but has a valid ACR Token
  # Authenticate using SIW with ACR values 'urn:okta:loa:2fa:any:ifpossible'
  Given Mary is on the default view in an UNAUTHENTICATED state
  When she selects "urn:okta:loa:2fa:any:ifpossible" into "ACR values"
    And she clicks the "Update Config" button
  Then she sees "urn:okta:loa:2fa:any:ifpossible" in "ACR values"
  When she clicks the "Login using REDIRECT" button
  Then the app should construct an authorize request for the protected action, not including an ACR Token in the request but including the ACR value
   And she should be redirected to the Okta Sign In Widget
  When she inputs her username and password in widget
  Then she should be challenged to verify her "sms"
  When she verifies her sms
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is handled
  When she returns home
  Then she is redirected to the default view in an AUTHENTICATED state
  # Authenticate again with ACR values 'urn:okta:loa:2fa:any'
  When she selects "urn:okta:loa:2fa:any" into "ACR values"
    And she clicks the "Update Config" button
  Then she sees "urn:okta:loa:2fa:any" in "ACR values"
  When she clicks the "Login with ACR" button
  Then the Sign In Widget validates her token
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is handled
  When she returns home
  Then she is redirected to the default view in an AUTHENTICATED state
   And the app receives and additional token for this ACR value "urn:okta:loa:2fa:any"
   And the app stores this new token in Token Storage
   And she sees her ID and Access Tokens
  When she refreshes the page
  Then she sees the default view in an AUTHENTICATED state
    And she sees her ID and Access Tokens

Scenario: Mary is signed in, and Authorize request is not constructed with the right ACR Value
  Given Mary is on the default view in an UNAUTHENTICATED state
  When she selects incorrect value in "ACR values"
    And she clicks the "Login using REDIRECT" button
  Then the app should construct an authorize request for the protected action, not including an ACR Token in the request but including the bad ACR value
   And she should be redirected to the Okta Sign In Widget
  When she inputs her username and password in widget
  Then she is redirected to the handle callback page
  When she clicks the "Handle callback (Continue Login)" button
  Then the callback is not handled with error "AuthSdkError: The acr [undefined] does not match acr_values [bad-value]"
