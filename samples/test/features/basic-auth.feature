Feature: Direct Auth Basic Login with Password Factor

  Background:
	  Given an APP Sign On Policy that defines Password as required and the only factor for login
    #And the list of Authenticators only contains Email and Password
    #And a User named "Mary" created in the admin interface with a Password only

    Scenario: Mary logs in with a Password
      Given Mary navigates to Login with Username and Password
      When she fills in her username
      And she fills in her correct password
      And she submits the Login form
      Then a page loads with all of Mary's Profile information

     Scenario: Mary logs in with a Password
      Given the Sample App is assigned to a "Certain" group
      And Mary is not a member of the "Certain" group
      And Mary navigates to the Basic Login View
      When she fills in her username
      And she fills in her correct password
      And she submits the Login form
      Then she sees the message "User is not assigned to this application"
      And should see the login form again with blank fields

    # Scenario: Authenticate with Username and Password
    #   Given Password login form is displayed 
    #   When User enters username into the form
    #   And User enters password into the form
    #   And User submits the form
    #   Then User can verify their profile data