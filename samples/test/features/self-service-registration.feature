Feature: Self Service Registration with Email Activation and optional SMS

Background:
  Given an App that assigned to a test group
    And the app has Email Verification callback uri defined
    And a Policy that defines "Profile Enrollment"
    And with a Policy Rule that defines "collecting default attributes"
    And a Policy that defines "MFA Enrollment" with properties
     | okta_password      | REQUIRED |
     | okta_email         | REQUIRED |
     | phone_number       | OPTIONAL |
     And with a Policy Rule that defines "MFA Enrollment Challenge"
    And a user named "Mary"
    And she does not have account in the org

Scenario: Mary signs up for an account with Password, setups up required Email factor, then skips optional SMS
  When she clicks the 'signup' button
  Then she is redirected to the "Self Service Registration" page
  When she fills out her First Name
  And she fills out her Last Name
  And she fills out her Email
  And she submits the form
  Then she is redirected to the "Select Authenticator Method" page
  When she selects the "email" method
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
  Then she is redirected to the "Select Authenticator" page
  When she selects "Skip" on SMS
  Then she is redirected to the "Root" page
  And she sees a table with her profile info
  And the cell for the value of "email" is shown and contains her "email"

Scenario: Mary signs up for an account with Password, setups up required Email factor, And sets up optional SMS
  When she clicks the 'signup' button
  Then she is redirected to the "Self Service Registration" page
  When she fills out her First Name
    And she fills out her Last Name
    And she fills out her Email
    And she submits the form
  Then she is redirected to the "Select Authenticator Method" page
  When she selects the "email" method
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
  Then she is redirected to the "Select Authenticator" page
  When she selects the "Phone" factor
    And she submits the form
  Then she is redirected to the "Enroll Phone Authenticator" page
  When She inputs a valid phone number
    And she submits the form
  Then the screen changes to receive an input for a code
  When she inputs the correct code from her "SMS"
    And she submits the form
  Then she is redirected to the "Root" page
    And she sees a table with her profile info
    And the cell for the value of "email" is shown and contains her "email"

Scenario: Mary signs up with an invalid Email
  When she clicks the 'signup' button
  Then she is redirected to the "Self Service Registration" page
  When she fills out her First Name
  And she fills out her Last Name
  And she fills out her Email with an invalid email format
  And she submits the form
  Then she sees an error message "must be in the form of an email address"
  And she sees an error message "does not match required pattern"

Scenario: Mary signs up for an account with Password, sets up required Email factor, And sets up optional SMS with an invalid phone number
  When she clicks the 'signup' button
  Then she is redirected to the "Self Service Registration" page
  When she fills out her First Name
  And she fills out her Last Name
  And she fills out her Email
    And she submits the form
  Then she is redirected to the "Select Authenticator Method" page
  When she selects the "email" method
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
  Then she is redirected to the "Select Authenticator" page
  When she selects the "Phone" factor
    And she submits the form
  Then she is redirected to the "Enroll Phone Authenticator" page
  And she inputs an invalid phone number
  And she submits the form
  Then she should see an error message "Invalid Phone Number."

Scenario: Mary signs up for an account with Password, setups up required Email factor using email magic link
  When she clicks the 'signup' button
  Then she is redirected to the "Self Service Registration" page
  When she fills out her First Name
  And she fills out her Last Name
  And she fills out her Email
  And she submits the form
  Then she is redirected to the "Select Authenticator Method" page
  When she selects the "email" method
    And she submits the form
  Then she sees a page to input a code for email authenticator enrollment
  When she clicks the Email magic link for email verification
  Then she is redirected to the "Select Authenticator" page
  When she selects the "Password" factor
  And she submits the form
  Then she sees the set new password form
  And she fills out her Password
  And she confirms her Password
  And she submits the form
  Then she is redirected to the "Select Authenticator" page
  When she selects "Skip" on SMS
  Then she is redirected to the "Root" page
  And she sees a table with her profile info
  And the cell for the value of "email" is shown and contains her "email"
