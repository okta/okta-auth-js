Feature: Add another Required Attribute to the Profile Enrollment Policy

  Background:
    Given an App that assigned to a test group
      And a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines 'collecting default attributes and a required "customAttribute"'
      And a user named "Mary"
      And she does not have account in the org
 
  Scenario: Mary signs up for an account with a random property
    When she clicks the 'signup' button
    Then she is redirected to the "Self Service Registration" page
    When she fills out her First Name
    And she fills out her Last Name
    And she fills out her Email
    And she fills out another property
    And she submits the form
    # Then her user is created in the "Staged" state 
    Then she is redirected to the "Select Authenticator Method" page
