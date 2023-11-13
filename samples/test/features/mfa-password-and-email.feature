Feature: Multi-Factor Authentication with Password and Email

  Background:
    Given an App that assigned to a test group
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password + Another Factor"
      And a user named "Mary"
      And she has an account with "active" state in the org

  @flaky
  Scenario: Mary enters a wrong verification code
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she fills in her username
      And she fills in her correct password
      And she submits the form
    Then she is redirected to the "Verify Email" page
    When she selects "Email" from the list of methods
      And she submits the form
    Then she is redirected to the "Challenge email authenticator" page
    When she inputs an incorrect code
      And she submits the form
    Then the sample shows an error message "Invalid code. Try again." on the Sample App

  @flaky
  Scenario: 2FA Login with Email
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she is redirected to the "Verify Email" page
    When she selects "Email" from the list of methods
      And she submits the form
    Then the screen changes to receive an input for a Email code
    When she inputs the correct code from her "Email"
      And she submits the form
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
