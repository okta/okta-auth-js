Feature: ACR Values

Background:
  Given an App that assigned to a test group
    And a Policy that defines "Authentication"
    And with a Policy Rule that defines "Password as the only factor"
    And a Policy that defines "MFA Enrollment" with properties
    | okta_password | REQUIRED |
    | okta_email    | REQUIRED |
    And with a Policy Rule that defines "MFA Enrollment Challenge"
    And a user named "Mary"
    And she has an account with "active" state in the org

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
