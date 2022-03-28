Feature: TOTP Support (Google Authenticator) Sign Up
  Background:
    Given a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines "collecting default attributes and emailVerification is not required"
      And a Policy that defines "MFA Enrollment with Password and Google Authenticator as required authenticators"
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she does not have account in the org
    
  Scenario: Mary signs up for an account with Password, setups up required Google Authenticator by scanning a QR Code
    When she clicks the 'signup' button
    Then she is redirected to the "Self Service Registration" page
    When she fills out her First Name
      And she fills out her Last Name
      And she fills out her Email
      And she submits the registration form
    Then she sees the Select Authenticator page with password as the only option
    When she chooses password factor option
      # And she submits the select authenticator form
    Then she sees the set new password form
      And she fills out her Password
      And she confirms her Password
      And she submits the set new password form
    Then she sees a list of available factors to setup
    When she selects Google Authenticator from the list
    Then she sees a QR Code and a Secret Key on the screen
      And the QR code represents the same key as the Secret Key
    When She scans a QR Code
      And She selects "Next"
    Then the screen changes to receive an input for a code
    When she inputs the correct code from her Google Authenticator App for "enrollment"
      And She selects "Verify"
    Then she sees a list of available factors to setup
    When she selects "Skip"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
      And the cell for the value of "name" is shown and contains her "first name and last name"
