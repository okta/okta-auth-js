Feature: Self Service Registration with Email Activation and optional SMS

#Background:
  #Given a Profile Enrollment policy defined assigning new users to the Everyone Group and by collecting "First Name", "Last Name", and "Email", is allowed and assigned to a SPA, WEB APP or MOBILE application
  #And "Required before access is granted" is selected for Email Verification under Profile Enrollment in Security > Profile Enrollment
  #And configured Authenticators are Password (required), Email (required), and SMS (optional)
  #And a user named "Mary"
  #And Mary does not have an account in the org

  Scenario: Mary signs up for an account with Password, setups up required Email factor, And sets up optional SMS
  Given Mary navigates to the Self Service Registration View
  When she fills out her First Name
  And she fills out her Last Name
  And she fills out her Email
  And she submits the registration form
  #Then she sees the Select Authenticator page with password as the only option
  #When she chooses password factor option
  #And she submits the select authenticator form
  #Then she sees the set new password form
  #And she fills out her Password
  #And she confirms her Password
  #And she submits the set new password form
  #Then she sees a list of available factors to setup
  #When she selects Email
  #Then she sees a page to input a code
  #When she inputs the correct code from her email
  #Then she sees a list of factors to register
  #When She selects Phone from the list
  #And She inputs a valid phone number
  #And She selects "Receive a Code"
  #Then the screen changes to receive an input for a code
  #When She inputs the correct code from her SMS
  #And She selects "Verify"
  #Then she is redirected to the Root View
    #And an application session is created