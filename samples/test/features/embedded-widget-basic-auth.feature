Feature: Basic Login with Embedded Sign In Widget

  Background:
    Given an App that assigned to a test group
      And the app is assigned to "Everyone" group
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"
      And she has an account with "active" state in the org

  Scenario: Mary logs in with a Password
	  When she clicks the "login" button
    Then she is redirected to the "Embedded Widget" page
	  When she fills in her correct username
	    And she fills in her correct password
	    And she submits the form
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
      #And the cell for the value of "name" is shown and contains her "first name and last name"