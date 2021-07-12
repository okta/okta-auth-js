Feature: Basic Login with Embedded Sign In Widget

  Background:
    Given a SPA, WEB APP or MOBILE Policy that defines Password as required and the only factor for login
    #AND the list of Authenticators contains Email and Password
    #AND a User named "Mary" exists, and this user has already setup email and password factors

  Scenario: Mary logs in with a Password
	  Given Mary navigates to the Embedded Widget View
	  When she fills in her correct username
	    And she fills in her correct password
	    And she submits the Login form
    Then she is redirected to the Root View
      And she sees welcome text