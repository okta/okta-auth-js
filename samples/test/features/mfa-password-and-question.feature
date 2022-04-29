# This feature is not enabled in test, re-enable it - OKTA-492723
Feature: Multi-Factor Authentication with Password and Security Question

  Background:
    Given an App that assigned to a test group
	    And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password + Another Factor"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | REQUIRED |
        | security_question  | REQUIRED |
      And a user named "Mary"
      And she has an account with "active" state in the org

  Scenario: 2FA Login with Security Question
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she is redirected to the "Select Authenticator" page
    When She selects Security Question from the list
    Then the screen changes to challenge the Security Question
    When She inputs the correct answer for the Question
      And she submits the form
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
