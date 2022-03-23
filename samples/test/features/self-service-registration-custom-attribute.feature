Feature: Add another Required Attribute to the Profile Enrollment Policy

  Background:
    Given a Group
      And an App
      # And the app is assigned to "Everyone" group
      And a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines 'collecting default attributes and a required "customAttribute"'
      And a user named "Mary"
      And she does not have account in the org
 
  Scenario: Mary signs up for an account with a random property
    Given Mary navigates to the Self Service Registration View
    When she fills out her First Name
    And she fills out her Last Name
    And she fills out her Email
    And she fills out another property
    And she submits the registration form
    # Then her user is created in the "Staged" state 
    And she sees the Select Authenticator page with password as the only option
