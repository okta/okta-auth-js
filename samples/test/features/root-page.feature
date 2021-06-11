Feature: Root page for Direct Auth Demo Application

  Background:
	  Given an APP Sign On Policy that defines Password as required and the only factor for login
    And a User named "Mary" exists, and this user has already setup email and password factors

  Scenario: Mary visits the Root View WITHOUT an authentcation session (no tokens)
    Given Mary navigates to the Root View
    Then the Root Page shows links to the Entry Points
    
  Scenario: Mary visits the Root View and WITH an authentication session
    Given Mary has an authenticated session
    When Mary navigates to the Root View
    Then Mary sees a table with the claims from the /userinfo response
    And Mary sees a logout button

  Scenario: Mary logs out of the app
    Given Mary has an authenticated session
      And Mary navigates to the Root View
    When Mary clicks the logout button
    Then she is redirected back to the Root View
      And Mary sees login, registration buttons
      And she sees that claims from /userinfo are disappeared
