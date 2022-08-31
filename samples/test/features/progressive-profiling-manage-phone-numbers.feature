Feature: Managing Phone Numbers

  Background:
    Given an App that assigned to a test group
      And the app is granted "okta.myAccount.profile.read" scope
      And the app is granted "okta.myAccount.profile.manage" scope
      And the app is granted "okta.myAccount.email.manage" scope
      And the app is granted "okta.myAccount.phone.manage" scope
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"
      And she has an account with "active" state in the org
  
  Scenario: Mary Adds a phone number
    Given she is on the Root View in an AUTHENTICATED state
    Then she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
      And she sees a tip message for "identifiers" that "User identifiers are separated because changes require verification."
    When she clicks the "add phone number" button
    Then she sees a modal popup to "add phone number"
    When she fills in her "phone number"
      And she submits the form
    Then the form changes to receive an input for the verification code
    When she inputs the correct code from her "SMS"
      And she submits the form
    Then the page confirms her phone has been added
      And she sees the "remove phone number" button in "phone" section
      And she sees the "add phone number" button in "phone" section
  

  Scenario: [ERROR CASE] Mary Adds a phone number and enters the wrong OTP
    Given she is on the Root View in an AUTHENTICATED state
    Then she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
      And she sees a tip message for "identifiers" that "User identifiers are separated because changes require verification."
    When she clicks the "add phone number" button
    Then she sees a modal popup to "add phone number"
    When she fills in her "phone number"
      And she submits the form
    Then the form changes to receive an input for the verification code
    When she inputs an incorrect code
      And she submits the form
    # TODO: update error message once ciamx fix is in prod
    Then she sees a banner message for "add phone number" that "Invalid factor id, no phone factor found."

  Scenario: Mary deletes a phone number
    Given she is on the Root View in an AUTHENTICATED state
      And she has enrolled in the "SMS" factor
    Then she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
      And she sees a tip message for "identifiers" that "User identifiers are separated because changes require verification."
      And she sees her phone number
    When she clicks the "remove phone number" button in "phone" section
    Then she sees a confirmation dialog to "remove phone number" with "Are you sure you want to remove this phone number?"
    When she clicks the "remove" button
    Then the page should render without the desired phone number
