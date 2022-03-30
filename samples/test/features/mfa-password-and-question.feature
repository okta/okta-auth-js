Feature: Multi-Factor Authentication with Password and Security Question

  Background:
	  Given a SPA, WEB APP or MOBILE Policy that defines MFA with Password and Security Question as required
	  #And a User named "Mary" created in the admin interface with a Password only

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
