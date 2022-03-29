Feature: Update Email Address

  Background:
    Given an App that assigned to a test group
      And the app is granted "okta.myAccount.profile.read" scope
      And the app is granted "okta.myAccount.profile.manage" scope
      And the app is granted "okta.myAccount.email.manage" scope
      And the app is granted "okta.myAccount.phone.manage" scope
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password as the only factor"
      And a user named "Mary"
      And she has an account with "active" state in the org
      And she has a second credential

  # //SCENARIO 12.3.1 is for FUTURE ITERATIONS
  # [FUTURE] Scenario 12.3.1: Mary Updates her email address through her profile using a magic link
  #   GIVEN Mary is on the Root View in an AUTHENTICATED state
  #   AND she sees a table with her profile info as defined by the Profile Enrollment Policy
  #   AND the cell for the value of "email" is shown and contains her email
  #   AND the cell for the value of "name" is shown and contains her first name and last name
  #   AND the email field has additional information below the input control that says "Changing your email will require additional verification" 
  #   WHEN she clicks the edit email button
  #   THEN the screen changes to enter an new email
  #   WHEN she changes her email to a different valid email address
  #   AND clicks "Save"
  #   THEN she receives an email with a link and an OTP to verify their email
  #   WHEN she clicks the link
  #   THEN she is taken to a new page that confirms her email has been updated
  #   AND the original tab shows the new email address
  
  Scenario: Mary Updates her email address through her profile using an OTP
    Given she is on the Root View in an AUTHENTICATED state
      And she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
      And she sees a tip message for "identifiers" that "User identifiers are separated because changes require verification."
    When she clicks the "edit primary email" button
    Then she sees a modal popup to "edit primary email"
    When she changes her email to a different valid email address
      And she submits the form
    Then the form changes to receive an input for the verification code
    When she inputs the correct code from her "Updated Email"
      And she submits the form
    Then her "primary email" is updated to the new email address 

  # //SCENARIO 12.3.3 is for FUTURE ITERATIONS 
  # [FUTURE] Scenario 12.3.3: [ERROR CASE] Mary Updates her email address through her profile using an invalid or expired link
  #   GIVEN Mary is on the Root View in an AUTHENTICATED state
  #   AND she sees a table with her profile info as defined by the Profile Enrollment Policy
  #   AND the cell for the value of "email" is shown and contains her email
  #   AND the cell for the value of "name" is shown and contains her first name and last name
  #   WHEN she clicks the edit button
  #   THEN the screen changes for inputs on the profile field
  #   AND the email field has additional information below the input control that says "Changing your email will require additional verification" 
  #   WHEN she changes her email to a different valid email address
  #   AND clicks "Save"
  #   THEN she receives an email with a link and an OTP to verify their email
  #   WHEN she clicks the link
  #   THEN she is taken to a new page that states "The link is expired or invalid"
  #   AND the original tab shows the new email address

  Scenario: [ERROR CASE] Mary Updates her email address through her profile using an expired/invalid OTP
    Given she is on the Root View in an AUTHENTICATED state
    And she sees a table with her profile info
      And the cell for the value of "primary email" is shown and contains her "primary email"
      And the cell for the value of "first name" is shown and contains her "first name"
      And the cell for the value of "last name" is shown and contains her "last name"
      And she sees a tip message for "identifiers" that "User identifiers are separated because changes require verification."
    When she clicks the "edit primary email" button
    Then she sees a modal popup to "edit primary email"
    When she changes her email to a different valid email address
      And she submits the form
    Then the form changes to receive an input for the verification code
    When she inputs an incorrect code
      And she submits the form
    Then she sees a banner message for "edit primary email" that "User is not authorized."
