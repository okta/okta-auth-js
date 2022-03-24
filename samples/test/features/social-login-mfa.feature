Feature: Direct Auth Social Login with MFA
  
  Background:
    Given an App
      And the app is assigned to "Everyone" group
      And a Policy that defines "Authentication"
      And with a Policy Rule that defines "Password + Another Factor"
      And a user named "Mary"
      And she has an account with "active" state in the org

  Scenario: Mary logs in with a Okta OIDC IDP and gets an error message
    Given Mary navigates to the Login View
    When she clicks the Login with Okta OIDC IDP button
    And logs in to Okta OIDC IDP
    # And the remediation returns "MFA_REQUIRED"
    # Then she should see an error message "Multifactor Authentication and Social Identity Providers is not currently supported, Authentication failed."   
