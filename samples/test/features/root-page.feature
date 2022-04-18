Feature: Root page for Direct Auth Demo Application

  Background:
    Given an App that assigned to a test group
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"
      And she has an account with "active" state in the org

  Scenario: Mary visits the Root View WITHOUT an authentcation session (no tokens)
    Then she sees the "signin" button
      And she sees the "signup" button
    
  Scenario: Mary visits the Root View and WITH an authentication session
    Given she is on the Root View in an AUTHENTICATED state
    Then she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
      And she sees the "logout" button

  Scenario: Mary logs out of the app
    Given she is on the Root View in an AUTHENTICATED state
    When she clicks the "logout" button
    Then she is redirected to the "Root" page
      And she sees the "signin" button
      And she sees the "signup" button
      #And she sees that claims from /userinfo are disappeared
