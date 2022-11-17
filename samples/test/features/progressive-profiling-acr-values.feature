Feature: Update Profile Information with Re-Authentication with ACR values

  Background:
    Given an App that assigned to a test group
      And the app is granted "okta.myAccount.profile.read" scope
      And the app is granted "okta.myAccount.profile.manage" scope
      And the app is granted "okta.myAccount.email.manage" scope
      And the app is granted "okta.myAccount.phone.manage" scope
      # And the app has a custom User Profile Schema named "age" // predefined in User (default)
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | REQUIRED |
        | google_otp    | OPTIONAL |
        | phone_number  | OPTIONAL |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she has an account with active state in the org and her "age" is "30"
      And she has enrolled in the "SMS" factor
      And she has enrolled in the "Google Authenticator" factor

  Scenario: Mary updates her profile information
    Given she is on the Root View in an AUTHENTICATED state
      And she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
    When she clicks the "edit profile" button
    Then the "first name" field is available for input
      And the "last name" field is available for input
      And the "age" field is available for input
    When she changes the "first name" field to "Marianne"
      And she clicks the "save profile" button
    Then she sees a modal popup to "Insufficient Authentication"
    When she selects approach "Re-Authenticate with Embedded SDK"
    Then she is redirected to the "Select Authenticator Authenticate" page
    When she selects authenticator "Google Authenticator"
    Then the form changes to receive an input for the verification code
    When she inputs the correct code from her "Google Authenticator App"
      And she submits the form
    Then she sees a table with her profile info
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
    When she clicks the "edit profile" button
    Then the "first name" field is available for input
      And the "last name" field is available for input
    When she changes the "first name" field to "Marianne"
      And she clicks the "save profile" button
    Then she sees a banner message for "profile" that "The profile was updated successfully"
      And the "first name" field shows "Marianne" in disabled state
