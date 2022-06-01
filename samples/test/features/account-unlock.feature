Feature: Account Unlock with Single factor (Email, Phone, Okta Verify Push)

  Background:
  Given an App that assigned to a test group
    And a Policy that defines "Authentication"
     And with a Policy Rule that defines "Password as the only factor"
    And a Policy that defines "Account Recovery"
     And with a Policy Rule that defines "Account Unlock with Email or SMS"
    And a user named "Mary"
     And she has an account with "active" state in the org


#  Background:
#    GIVEN a SPA, WEB APP or MOBILE Sign On Policy that defines Password as required
#    AND Password Policy is set to Lock out user after 1 unsuccessful attempt
#    AND the Password Policy Rule "Users can perform self-service" has "Unlock Account" checked
#    AND the Password Policy Rule "Users can initiate Recovery with" has "Phone (SMS / Voice Call)" and "Email" checked
#    AND the Password Policy Rule "Additional Verification is" has "Not Required" checked
#    AND a User named "Mary" exists, and this user has already setup email and password factors
#    AND Mary has entered an incorrect password to trigger an account lockout


  Scenario: Mary recovers from a locked account with Email OTP
    When she clicks the 'unlock-account' button
    Then she is redirected to the "Unlock Account" page
    When she clicks the 'signup' button
    Then she sees a page to input her user name and select Email, Phone, or Okta Verify to unlock her account
    When she inputs her email
     And she selects Email
    Then she should see a screen telling her to "Verify with your email"
     And she should see an input box for a code to enter from the email
    When she enters the OTP from her email in the original tab
     And submits the form
    Then she should see a terminal page that says "Account Successfully Unlocked!"
     And she should see a link on the page to go back to the Basic Login View
