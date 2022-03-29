Feature: Direct Auth Basic Login with Password Factor

  Background:
    Given an App that assigned to a test group
      And the app is granted "okta.myAccount.profile.read" scope
      And the app is granted "okta.myAccount.profile.manage" scope
      And the app is granted "okta.myAccount.email.manage" scope
      And the app is granted "okta.myAccount.phone.manage" scope
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"

    Scenario: Mary logs in with a Password
      Given she has an account with "active" state in the org
      When she clicks the "login" button
      Then she is redirected to the "Login" page
      When she fills in her "username"
        And she fills in her "password"
        And she submits the form
      Then she sees a table with her profile info
        And the cell for the value of "email" is shown and contains her "email"
        #And the cell for the value of "name" is shown and contains her "first name and last name"

    Scenario: Mary doesn't know her username
      Given she does not have account in the org
        And the app is assigned to "Everyone" group
      When she clicks the "login" button
      Then she is redirected to the "Login" page
      When she fills in an incorrect "username" with value "Mory"
        And she fills in her "password"
        And she submits the form
      Then she should see a message on the Login form "There is no account with the Username Mory."

    Scenario: Mary doesn't know her password
      Given she has an account with "active" state in the org
      When she clicks the "login" button
      Then she is redirected to the "Login" page
      When she fills in her "username"
        And she fills in an incorrect "password"
        And she submits the form
      Then she should see the message "Authentication failed"
