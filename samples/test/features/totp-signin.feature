Feature: TOTP Support (Google Authenticator) Sign In

  Background:
    Given a Policy that defines "MFA Enrollment" with properties
      | okta_password | REQUIRED |
      | google_otp    | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password + Another Factor"
      And a user named "Mary"
      And she has an account with "active" state in the org

  Scenario: Mary signs in to an account and enrolls in Password and Google Authenticator by scanning a QR Code 
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she sees the list of required factors (Google Authenticator) to enroll
    When she selects Google Authenticator from the list
    Then she sees a QR Code and a Secret Key on the screen
      And the QR code represents the same key as the Secret Key
    When She scans a QR Code
      And She selects "Next"
    Then the screen changes to receive an input for a code
    When she inputs the correct code from her Google Authenticator App for "enrollment"
      And She selects "Verify"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
      And the cell for the value of "name" is shown and contains her "first name and last name"

  Scenario: Mary Signs in to the Sample App with Password and Google Authenticator
    Given she has enrolled in the "Google Authenticator" factor
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
      And she submits the form
    # Then she is presented with an option to select Google Authenticator to verify
    # When She selects Google Authenticator from the list
    Then the screen changes to receive an input for a code
    When she inputs the correct code from her Google Authenticator App for "authentication"
      And She selects "Verify"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
      And the cell for the value of "name" is shown and contains her "first name and last name"
