Feature: Security Questions

  Background:
    Given a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines 'collecting default attributes and a required "Age" and emailVerification is not required'
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password     | REQUIRED |
        | security_question | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she does not have account in the org

  Scenario: Mary signs up for an account and enrolls in Password and a custom Security Question
    When she clicks the 'signup' button
    Then she is redirected to the "Self Service Registration" page
    When she fills out her First Name
      And she fills out her Last Name
      And she fills out her Email
      And she fills out her Age
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Password" factor
      And she submits the form
    Then she sees the set new password form
      And she fills out her Password
      And she confirms her Password
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Security Question" factor
      And she submits the form
    Then she sees a screen to "Set up security question"
      And she sees a radio option to "Choose a Security Question" or "Create my own security question"
      And the option "Choose a Security Question" is selected
    When she selects the radio option to "Create my own security question"
    Then she sees the dropdown list change to an input box to "Create my own security question"
      And she enters "Atko" in the question
      And she enters "Okta" in the answer
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects "Skip" on Email
    Then she is redirected to the "Root" page
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
      And the cell for the value of "name" is shown and contains her "first name and last name"
    