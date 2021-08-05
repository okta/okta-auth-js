Feature: Multi-Factor Authentication with Password and Security Question

  Background:
	  Given a SPA, WEB APP or MOBILE Policy that defines MFA with Password and Security Question as required
	  #And a User named "Mary" created in the admin interface with a Password only

  Scenario: 2FA Login with Security Question
    Given Mary navigates to the Basic Login View
      And she has inserted her username
      And she has inserted her password
      And her password is correct
    When she clicks Login
    Then she is presented with an option to select Security Question to verify
    When She selects Security Question from the list
    Then the screen changes to challenge the Security Question
    When She inputs the correct answer for the Question
      And She selects "Verify"
    Then she is redirected to the Root View
      And an application session is created
