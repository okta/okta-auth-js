Feature: Multi-Factor Authentication with Password and WebAuthn
  
  Background:
    Given an App that assigned to a test group
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password + Another Factor"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | REQUIRED |
        | webauthn      | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she has an account with "active" state in the org
    
  Scenario: Mary Logs into the Sample App with Password and enrolls in WebAuthn
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "WebAuthn" factor
      And she enrolls into webauthn
      And she submits the form
    Then she is redirected to the "Enroll WebAuthn" page
    When she selects "Continue"
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
      And the cell for the value of "name" is shown and contains her "first name and last name"
