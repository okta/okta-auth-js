Feature: Account Unlock with Single factor (Email, Phone, Okta Verify Push)

  Background:
  Given an App that assigned to a test group
    And a Policy that defines "Authentication"
     And with a Policy Rule that defines "Password as the only factor"
    And a Password Policy is set to Lock out user after 1 unsuccessful attempt
     And the Password Policy Rule "Users can perform self-service" has "Unlock Account" checked
     And the Password Policy Rule "Users can initiate Recovery with" has "Phone (SMS / Voice Call)" and "Email" checked
     And the Password Policy Rule "Additional Verification is" has "Not Required" checked
    And a user named "Mary"
     And she has an account with "active" state in the org

  Scenario: Mary recovers from a locked account with Email OTP
    Given Mary has entered an incorrect password to trigger an account lockout
    When she clicks the "Unlock Account" button
    Then she is redirected to the "Unlock Account" page
    When she submits the form
    Then she sees a page to input her user name and select Email, Phone, or Okta Verify to unlock her account
    When she inputs her recovery email
     And she selects the "Email" factor
     And she submits the form
    Then she sees a page to challenge her email authenticator
    When she inputs the correct code from her "Email"
     And she submits the form
    Then she should see a message containing "unlocked!"

  Scenario: Mary recovers from a locked account with Email magic link
    Given Mary has entered an incorrect password to trigger an account lockout
    When she clicks the "Unlock Account" button
    Then she is redirected to the "Unlock Account" page
    When she submits the form
    Then she sees a page to input her user name and select Email, Phone, or Okta Verify to unlock her account
    When she inputs her recovery email
     And she selects the "Email" factor
     And she submits the form
    Then she sees a page to challenge her email authenticator
    When she clicks the Email magic link for unlock
    Then she should see a message containing "unlocked!"

  @smstest
  Scenario: Mary recovers from a locked account with Phone SMS OTP
    Given she has enrolled in the "SMS" factor
     And Mary has entered an incorrect password to trigger an account lockout
    When she clicks the "Unlock Account" button
    Then she is redirected to the "Unlock Account" page
    When she submits the form
    Then she sees a page to input her user name and select Email, Phone, or Okta Verify to unlock her account
    When she inputs her recovery email
     And she selects the "Phone" factor
     And she submits the form
    Then the screen changes to receive an input for a code to verify
    When she inputs the correct code from her "SMS"
     And she submits the form
    Then she should see a message containing "unlocked!"
