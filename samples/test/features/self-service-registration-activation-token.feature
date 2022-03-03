Feature: Add another Required Attribute to the Profile Enrollment Policy

  Background:
    Given a Profile Enrollment policy defined assigning new users to the Everyone Group and by collecting "First Name", "Last Name", "Email", and a random property is allowed and assigned to a SPA, WEB APP or MOBILE application
    And a User named "Mary" is created in staged state
 
  Scenario: Mary signs up for an account using activation token
    Given Mary opens the Self Service Registration View with activation token
  #   And she sees the Select Authenticator page with password as the only option
