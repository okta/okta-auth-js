Feature: TOTP Support (Okta Verify) Sign Up
  Background:
    Given an App that assigned to a test group
      And a Policy that defines "Profile Enrollment"
      And with a Policy Rule that defines "collecting default attributes and emailVerification is not required"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | REQUIRED |
        | okta_verify    | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she does not have account in the org
    
  Scenario: Mary signs up for an account with Password, setups up required Okta Verify by scanning a QR Code
    When she clicks the 'signup' button
    Then she is redirected to the "Self Service Registration" page
    When she fills out her First Name
      And she fills out her Last Name
      And she fills out her Email
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Password" factor
      And she submits the form
    Then she sees the set new password form
      And she fills out her Password
      And she confirms her Password
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Okta Verify" factor
      And she submits the form
    Then she is redirected to the "Enroll Okta Verify" page
      And she sees a QR Code on the screen
    ## Steps below can't be automated without device push support
    # When she scans a QR Code
    #   And she adds the account to Okta Verify
    # Then she is redirected to the "Root" page
    #   And she sees a table with her profile info
    #   And the cell for the value of "email" is shown and contains her "email"
    #   And the cell for the value of "name" is shown and contains her "first name and last name"

  Scenario: Mary signs up for an account with Password, setups up required Okta Verify by clicking a link in a text message
    When she clicks the 'signup' button
    Then she is redirected to the "Self Service Registration" page
    When she fills out her First Name
      And she fills out her Last Name
      And she fills out her Email
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Password" factor
      And she submits the form
    Then she sees the set new password form
      And she fills out her Password
      And she confirms her Password
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Okta Verify" factor
      And she submits the form
    Then she is redirected to the "Enroll Okta Verify" page
      And she sees a QR Code on the screen
      And she selects "Enroll with another method"
      Then she is redirected to the "Select Enrollment Channel" page
    When she selects the "SMS" enrollment method
      And she submits the form
    When she inputs a valid phone number for Okta Verify
      And she submits the form
    Then the screen changes to a waiting screen saying "We sent an SMS to {phone_number} with an Okta Verify setup link. To continue, open the link on your mobile device."
    Then she receives a "SMS" with a link to enroll in Okta Verify
    ## Steps below can't be automated without device push support
    # When she clicks the link in her text message from her phone
    # Then she is redirected to the "Root" page
    #   And she sees a table with her profile info
    #   And the cell for the value of "email" is shown and contains her "email"
    #   And the cell for the value of "name" is shown and contains her "first name and last name"

  Scenario: Mary signs up for an account with Password, setups up required Okta Verify by clicking a link in email
    When she clicks the 'signup' button
    Then she is redirected to the "Self Service Registration" page
    When she fills out her First Name
      And she fills out her Last Name
      And she fills out her Email
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Password" factor
      And she submits the form
    Then she sees the set new password form
      And she fills out her Password
      And she confirms her Password
      And she submits the form
    Then she is redirected to the "Select Authenticator" page
    When she selects the "Okta Verify" factor
      And she submits the form
    Then she is redirected to the "Enroll Okta Verify" page
      And she sees a QR Code on the screen
      And she selects "Enroll with another method"
      Then she is redirected to the "Select Enrollment Channel" page
    When she selects the "Email" enrollment method
      And she submits the form
    When she inputs a valid email for Okta Verify
      And she submits the form
    Then she receives a "Email" with a link to enroll in Okta Verify
    Then the screen changes to a waiting screen saying "We sent an Email to {email_address} with an Okta Verify setup link. To continue, open the link in your email."
    ## Steps below can't be automated without device push support
    # When she clicks the link in her email
    # Then she is redirected to the "Root" page
    #   And she sees a table with her profile info
    #   And the cell for the value of "email" is shown and contains her "email"
    #   And the cell for the value of "name" is shown and contains her "first name and last name"
