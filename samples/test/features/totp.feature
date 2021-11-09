Feature: TOTP Support (Google Authenticator)

  Background:
	  Given configured Authenticators are Password (required), and Google Authenticator (required)
    And a user named "Mary"
    And Mary has an account in the org
    And she is not enrolled in any authenticators

  Scenario: Mary signs in to an account and enrolls in Password and Google Authenticator by scanning a QR Code 
    Given Mary navigates to the Basic Login View
      And she has inserted her username
      And she has inserted her password
      And her password is correct
    When she clicks Login
    Then she sees the list of required factors (Google Authenticator) to enroll
    When She selects Google Authenticator from the list
      And She scans a QR Code
      And She selects "Next"
    Then the screen changes to receive an input for a code
    When She inputs the correct code from her Google Authenticator App
      And She selects "Verify"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her email
      And the cell for the value of "name" is shown and contains her first name and last name

  Scenario: Mary signs in to an account and enrolls in Password and Google Authenticator by entering a Secret Key
     Given Mary navigates to the Basic Login View
      And she has inserted her username
      And she has inserted her password
      And her password is correct
    When she clicks Login
    Then she sees the list of required factors (Google Authenticator) to enroll
    When She selects Google Authenticator from the list
      And She enters the shared Secret Key into the Google Authenticator App
      And She selects "Next" on the screen which is showing the QR code
    Then the screen changes to receive an input for a code
    When She inputs the correct code from her Google Authenticator App
      And She selects "Verify"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her email
      And the cell for the value of "name" is shown and contains her first name and last name

  Scenario: Mary Signs in to the Sample App with Password and Google Authenticator
    Given Mary navigates to the Basic Login View
      And she has inserted her username
      And she has inserted her password
      And her password is correct
    When she clicks Login
    # Then she is presented with an option to select Google Authenticator to verify
    # When She selects Google Authenticator from the list
    Then the screen changes to receive an input for a code
    When She inputs the correct code from her Google Authenticator App
      And She selects "Verify"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her email
      And the cell for the value of "name" is shown and contains her first name and last name
