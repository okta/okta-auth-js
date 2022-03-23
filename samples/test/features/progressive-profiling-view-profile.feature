Feature: View Profile Information 
  
  Background:
    Given an App
      And the app is granted "okta.myAccount.read" scope
      And the app is granted "okta.myAccount.manage" scope
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"
      And she has an account with "active" state in the org
    
  Scenario: Mary views her profile
    Given Mary is on the Root View in an UNAUTHENTICATED state
    When she logs in to the app
    Then she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
      And she sees an "Edit" button incidating she can update her profile
