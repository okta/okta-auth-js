Feature: Add another Required Attribute to the Profile Enrollment Policy

  Background:
    Given a Profile Enrollment policy defined assigning new users to the Everyone Group and by collecting "First Name", "Last Name", "Email", and a random property is allowed and assigned to a SPA, WEB APP or MOBILE application
    # And "Required before access is granted" is selected for Email Verification under Profile Enrollment in Security > Profile Enrollment
    # And configured Authenticators are Password (required), Email (required), and SMS (optional)
    And a user named "Mary"
    # And Mary does not have an account in the org
 
  Scenario: Mary signs up for an account with a random property
    Given Mary navigates to the Self Service Registration View
    When she fills out her First Name
    And she fills out her Last Name
    And she fills out her Email
    # And she fills out another property
    And she submits the registration form
    # Then her user is created in the "Staged" state 
    And she sees the Select Authenticator page with password as the only option
