Feature: Update Profile Information

  Background:
    Given an App that assigned to a test group
      And the app is granted "okta.myAccount.profile.read" scope
      And the app is granted "okta.myAccount.profile.manage" scope
      And the app is granted "okta.myAccount.email.manage" scope
      And the app is granted "okta.myAccount.phone.manage" scope
      # And the app has a custom User Profile Schema named "age" // predefined in User (default)
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"

  Scenario: Mary updates her profile information
    Given she has an account with "active" state in the org
      And she is on the Root View in an AUTHENTICATED state
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
    Then she sees a banner message for "profile" that "The profile was updated successfully"
      And the "first name" field shows "Marianne" in disabled state

  Scenario: [ERROR CASE] Mary updates her profile information with an invalid input
    Given she has an account with active state in the org and her "age" is "30"
      And she is on the Root View in an AUTHENTICATED state
      And she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
    When she clicks the "edit profile" button
    Then the "first name" field is available for input
      And the "last name" field is available for input
      And the "age" field is available for input
    When she changes the "age" field to "Thirty"
      And she clicks the "save profile" button
    Then she sees a banner message for "profile" that "Api validation failed: forUpdate"
      And the "age" field shows the previous profile value
    