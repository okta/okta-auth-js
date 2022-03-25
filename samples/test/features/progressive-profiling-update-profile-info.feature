Feature: Update Profile Information

  Background:
    Given an App
      And the app is granted "okta.myAccount.read" scope
      And the app is granted "okta.myAccount.manage" scope
      And the app has a custom User Profile Schema named "age"
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"
      And she has an account with "active" state in the org

  Scenario: Mary updates her profile information
    Given Mary is on the Root View in an AUTHENTICATED state
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
    Then she sees a banner message that "The profile was updated successfully"
      And the "first name" field shows "Marianne" in disabled state

  # Scenario: [ERROR CASE] Mary updates her profile information with an invalid input
  #   Given Mary is on the Root View in an AUTHENTICATED state
  #     And she sees a table with her profile info as defined by the Profile Enrollment Policy
  #     And the cell for the value of "email" is shown and contains her email
  #     And the cell for the value of "name" is shown and contains her first name and last name
  #   When she clicks the edit button
  #   Then the screen changes for inputs on the profile field
  #   When she changes the age field to "Thirty"
  #     And she clicks "Save"
  #   Then she sees an error message that the age field has the incorrect data type <<Need copy here>>
  #     And the age field shows the previous value
    