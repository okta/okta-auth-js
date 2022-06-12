Feature: WebAuthn Sign Up
  Background:
    Given an App that assigned to a test group
      And a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines "collecting default attributes and emailVerification is not required"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | REQUIRED |
        | webauthn    | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she does not have account in the org
    
  Scenario: Mary signs up for an account with Password, setups up required WebAuthn
    When she clicks the 'signup' button
    Then she is redirected to the "Self Service Registration" page
    When she fills out her First Name
      And she fills out her Last Name
      And she fills out her Email
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Password" factor
      And she submits the form
    Then she sees the set new password form
      And she fills out her Password
      And she confirms her Password
      And she submits the form
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