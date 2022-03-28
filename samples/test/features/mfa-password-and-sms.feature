Feature: Multi-Factor Authentication with Password and SMS

  Background:
    Given a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password + Another Factor"
      And a Policy that defines "MFA Enrollment" with properties
        | okta_password | REQUIRED |
        | phone_number  | REQUIRED |
      And with a Policy Rule that defines "MFA Enrollment Challenge"
      And a user named "Mary"
      And she has an account with "active" state in the org
	  
  Scenario: Enroll in SMS Factor prompt when authenticating
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she is presented with a list of factors
    When She selects SMS from the list
      And She inputs a valid phone number
      And She selects "Receive a Code"
    Then the screen changes to receive an input for a code
    When She inputs the correct code from the SMS
      And She selects "Verify"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"

  Scenario: Mary enters a wrong verification code on verify
    Given she has enrolled in the "SMS" factor
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she is presented with an option to select SMS to verify
    When She selects SMS from the list of methods
    Then the screen changes to receive an input for a code to verify
    When She inputs the incorrect code from the SMS
    Then the sample show as error message "Invalid code. Try again." on the SMS Challenge page
      And she sees a field to re-enter another code

  Scenario: Enroll with Invalid Phone Number
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she is presented with an option to select SMS to enroll
    When She selects SMS from the list
      And She inputs a invalid phone number
      And She selects "Receive a Code"
    Then she should see a message "Invalid Phone Number."


  Scenario: 2FA Login with SMS
    Given she has enrolled in the "SMS" factor
    When she clicks the "login" button
    Then she is redirected to the "Login" page
    When she has inserted her username
      And she has inserted her password
      And her password is correct
    When she submits the form
    Then she is presented with an option to select SMS to verify
    When She selects SMS from the list of methods
      And She selects "Receive a Code"
    Then the screen changes to receive an input for a code to verify
    When She inputs the correct code from the SMS
      And She selects "Verify"
    Then she is redirected to the Root View
      And she sees a table with her profile info
      And the cell for the value of "email" is shown and contains her "email"
