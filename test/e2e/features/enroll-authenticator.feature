Feature: Enroll Authenticator via Authorize Endpoint

Background:
  Given an App that assigned to a test group
    And a Policy that defines "Authentication"
    And with a Policy Rule that defines "Password as the only factor"
      And a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines "collecting default attributes and emailVerification is not required"
    And a Policy that defines "MFA Enrollment" with properties
     | okta_password | REQUIRED |
     | okta_email    | REQUIRED |
     | security_question  | OPTIONAL |
    And with a Policy Rule that defines "MFA Enrollment Challenge"
    And a user named "Mary"
    And she has an account with "active" state in the org

Scenario: Mary Enrolls into Security Question
  Given I am on the home page
    And I see text "Unauthenticated"
  When I enter "kba" into "Enroll AMR values (coma separated)"
    And I click "Update Config"
  Then I see "kba" in "Enroll AMR values (coma separated)"
  When I click "Enroll Authenticator"
  Then I am on the "enroll_authenticator" page with title "Sign In"
  When I enter correct username into "Username"
    And I enter correct password into "Password"
    And I click "Sign in"
  Then I am on the "enroll_authenticator" page with title "Get a verification email"
  When I click "Send me an email"
  Then I am on the "enroll_authenticator" page with title "Verify with your email"
  When I click "Enter a verification code instead"
    And I enter correct code into "Enter Code"
    And I click "Verify"
  Then I am on the "enroll_authenticator" page with title "Set up security methods"
  When I click "Set up" for "Security Question"
  Then I am on the "enroll_authenticator" page with title "Set up security question"
    And I see radio with "Choose a security question" and "Create my own security question"
    And The option "Choose a security question" is selected
  When I enter correct answer into "Answer"
    And I click "Verify"
  Then I am on the "login_callback" page
  When I click "Handle callback (Continue Login)"
  Then I see text "Authenticator enrollment completed"
  When I click "Return Home"
  Then I am on the home page
    And I see text "Unauthenticated"
