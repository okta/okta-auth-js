Feature: Add another Required Attribute to the Profile Enrollment Policy

  Background:
    Given a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines "collecting default attributes"
      And a user named "Mary"
      And she has an account with "staged" state in the org
 
  Scenario: Mary signs up for an account using activation token
    Given Mary opens the Self Service Registration View with activation token
    Then she is redirected to the "Select Authenticator" page
