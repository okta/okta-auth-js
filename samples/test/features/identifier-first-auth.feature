Feature: Login with Identifier First

  Background:
    Given a org with Global Session Policy that defines the Primary factor as "Password / IDP / any factor allowed by app sign on rules"
      And an App that assigned to a test group
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Any one factor"
      And a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines "collecting default attributes and emailVerification is not required"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | OPTIONAL |
        | okta_email    | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she has an account with "active" state in the org

  @flaky
  Scenario: Mary logs in with Email with an OTP 
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she fills in her username
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Email" factor
      And she submits the form
    Then she is redirected to the "Verify Email" page
    When she selects "Email" from the list of methods
      And she submits the form
    Then the screen changes to receive an input for a Email code
    When she inputs the correct code from her "Email"
      And she submits the form
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"

  @flaky
  Scenario: Mary Logs in with Email Magic Link on the same Browser
    Given the app has Email Verification callback uri defined
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she fills in her username
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Email" factor
      And she submits the form
    Then she is redirected to the "Verify Email" page
    When she selects "Email" from the list of methods
      And she submits the form
      And she clicks the Email magic link
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
    
  Scenario: Mary Logs in with a Password
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she fills in her username
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Password" factor
      And she submits the form
    Then she is redirected to the "Challenge Password Authenticator" page
    When she fills in her correct password
      And she submits the form
    Then she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
