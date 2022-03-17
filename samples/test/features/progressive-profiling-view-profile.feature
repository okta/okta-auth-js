Feature: View Profile Information 
  
  Background:
    Given a Profile defined assigning new users to the Everyone Group
    # And by collecting "First Name", "Last Name", "Email", and another property "Age" is allowed and assigned to a SPA, WEB APP or MOBILE application
    # And a user named "Mary"
    # And Mary has an account in the org
    
  Scenario: Mary views her profile
    Given Mary is on the Root View in an UNAUTHENTICATED state
    When she logs in to the app
    Then she sees a table with her profile info
    And the cell for the value of "primary email" is shown and contains her email
    #And the cell for the value of "name" is shown and contains her first name and last name
    And she sees an "Edit" button incidating she can update her profile
