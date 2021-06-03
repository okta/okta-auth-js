Feature: Root page for Direct Auth Demo Application

  Background:

    Scenario: Mary visits the Root View WITHOUT an authentcation session (no tokens)
      Given Mary navigates to the Root View
      Then the Root Page shows links to the Entry Points
      
    Scenario: Mary visits the Root View and WITH an authentication session
      Given Mary has an authenticated session
      When Mary navigates to the Root View
      Then Mary sees a table with the claims from the /userinfo response
      And Mary sees a logout button
