Feature: Multi-Factor Authentication with Password and Email Magic Link

  Background:
    # Email Verification callback uri cannot be configed via management API
    # Use predefined org for now
	  Given a predefined App that defines "MFA with Password and Email as required"
      And a user named "Mary"
      And she has an account with "active" state in the org

  Scenario: 2FA Login with Email Magic Link on the same browser
    Given Mary navigates to the Basic Login View
      And she has inserted her username
      And she has inserted her password
      And her password is correct
    When she clicks Login
    Then she is presented with an option to select Email to verify
    When She selects Email from the list
      And She selects "Receive a Code"
      And she clicks the Email magic link
    Then she is redirected to the Root View
      And an application session is created  
