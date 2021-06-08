Feature: Multi-Factor Authentication with Password and SMS

  Background:
	  Given a SPA, WEB APP or MOBILE Policy that defines MFA with Password and SMS as required
	    And an Authenticator Enrollment Policy that has PHONE as optional and EMAIL as required for the Everyone Group
	    And a User named "Mary" created that HAS NOT yet enrolled in the SMS factor

  Scenario: Enroll in SMS Factor prompt when authenticating
    Given Mary navigates to the Basic Login View
      And she has inserted her username
      And she has inserted her password
      And her password is correct
    When she clicks Login
    Then she is presented with a list of factors
    When She selects SMS from the list
      And She inputs a valid phone number
      And She selects "Receive a Code"
    Then the screen changes to receive an input for a code
    When She inputs the correct code from the SMS
      And She selects "Verify"
    Then she is redirected to the Root View
      And an application session is created
