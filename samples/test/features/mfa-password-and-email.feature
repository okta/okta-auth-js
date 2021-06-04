Feature: Multi-Factor Authentication with Password and Email

  Background:
	  Given a SPA, WEB APP or MOBILE Policy that defines MFA with Password and Email as required
	  And a User named "Mary" created in the admin interface with a Password only

  Scenario: Mary enters a wrong verification code
    Given Mary navigates to the Basic Login View
    When she fills in her username
      And she fills in her correct password
      And she clicks Login
    Then She sees a list of factors
    When She has selected Email from the list of factors
      And She inputs the incorrect code from the email
    Then the sample shows an error message "Invalid code. Try again." on the Sample App
