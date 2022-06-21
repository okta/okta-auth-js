Feature: View Profile Information 
  
  Background:
    Given an App that assigned to a test group
      And the app is granted "okta.myAccount.profile.read" scope
      And the app is granted "okta.myAccount.profile.manage" scope
      And the app is granted "okta.myAccount.email.manage" scope
      And the app is granted "okta.myAccount.phone.manage" scope
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"
      And she has an account with "active" state in the org
    
  Scenario: Mary views her profile
    Given she is on the Root View in an UNAUTHENTICATED state
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she fills in her "username"
      And she fills in her "password"
      And she submits the form
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
      And she sees the "edit profile" button
      # incidating she can update her profile
