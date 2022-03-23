Feature: Direct Auth Basic Login with Password Factor

  Background:
	  Given an App
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"

    Scenario: Mary logs in with a Password
      Given she has an account with "active" state in the org
        And Mary navigates to Login with Username and Password
      When she fills in her username
      And she fills in her correct password
      And she submits the Login form
      Then she is redirected to the Root View
        And she sees a table with her profile info
        And the cell for the value of "email" is shown and contains her "email"
        And the cell for the value of "name" is shown and contains her "first name and last name"

    Scenario: Mary clicks on the "Forgot Password Link"
      Given Mary navigates to the Basic Login View
      When she clicks on the "Forgot Password Link"
      Then she is redirected to the Self Service Password Reset View

    Scenario: Mary doesn't know her username
      Given she does not have account in the org
        And the app is assigned to "Everyone" group
        And Mary navigates to Login with Username and Password
      When she fills in her incorrect username
      And she fills in her password
      And she submits the Login form
      Then she should see a message on the Login form "There is no account with the Username Mory."

    Scenario: Mary doesn't know her password
      Given she has an account with "active" state in the org
        And Mary navigates to the Basic Login View
      When she fills in her correct username
      And she fills in her incorrect password
      And she submits the Login form with blank fields
      Then she should see the message "Authentication failed"
