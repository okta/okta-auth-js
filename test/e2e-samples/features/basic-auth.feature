Feature: Direct Auth Basic Login with Password Factor

  Background:
	  Given an APP Sign On Policy that defines Password as required and the only factor for login
    # And the list of Authenticators only contains Email and Password
    # And User Enumeration Prevention is set to ENABLED in Security > General
    And a User named "Mary" exists, and this user has already setup email and password factors

    Scenario: Mary logs in with a Password
      Given Mary navigates to Login with Username and Password
      When she fills in her username
      And she fills in her correct password
      And she submits the Login form
      Then she is redirected to the "Root View"
        And she sees a table with her profile info
        And the cell for the value of "email" is shown and contains her email
        And the cell for the value of "name" is shown and contains her first name and last name

    Scenario: Mary clicks on the "Forgot Password Link"
      Given Mary navigates to the Basic Login View
      When she clicks on the "Forgot Password Link"
      Then she is redirected to the "Self Service Password Reset View"

    Scenario: Mary doesn't know her username
      Given Mary navigates to Login with Username and Password
      When she fills in her incorrect username
      And she fills in her password
      And she submits the Login form
      Then she should see a message on the Login form "There is no account with the Username Mory."

    Scenario: Mary doesn't know her password
      Given Mary navigates to the Basic Login View
      When she fills in her correct username
      And she fills in her incorrect password
      And she submits the Login form with blank fields
      Then she should see the message "Authentication failed"
