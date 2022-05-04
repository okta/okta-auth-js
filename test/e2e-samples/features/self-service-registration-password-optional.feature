Feature: Self Service Registration with Email Activation and optional password

  Background:
    Given a org with Global Session Policy that defines the Primary factor as "Password / IDP / any factor allowed by app sign on rules"
      And an App that assigned to a test group
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Any one factor"
      And a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines "collecting default attributes and emailVerification is not required"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | OPTIONAL |
        | okta_email    | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she does not have account in the org

Scenario: Mary signs up for an account with required Email factor, then skips optional password
  When she clicks the 'signup' button
  Then she is redirected to the "Self Service Registration" page
  When she fills out her First Name
  And she fills out her Last Name
  And she fills out her Email
  And she submits the form
  Then she sees a page to input a code for email authenticator enrollment
  When she inputs the correct code from her "Email"
  And she submits the form
  Then she is redirected to the "Select Authenticator" page
  When she selects "Skip" on password
  Then she is redirected to the "Root" page
  And she sees a table with her profile info
  And the cell for the value of "email" is shown and contains her "email"

Scenario: Mary signs up for an account with required Email factor, then enrolls optional password
  When she clicks the 'signup' button
  Then she is redirected to the "Self Service Registration" page
  When she fills out her First Name
  And she fills out her Last Name
  And she fills out her Email
  And she submits the form
  Then she sees a page to input a code for email authenticator enrollment
  When she inputs the correct code from her "Email"
  And she submits the form
  Then she is redirected to the "Select Authenticator" page
  When she selects the "Password" factor
  And she submits the form
  Then she sees the set new password form
  And she fills out her Password
  And she confirms her Password
  And she submits the form
  Then she is redirected to the "Root" page
  And she sees a table with her profile info
  And the cell for the value of "email" is shown and contains her "email"

