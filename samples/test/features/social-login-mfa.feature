Feature: Direct Auth Social Login with MFA
  
  Background:
    Given a SPA, WEB APP or MOBILE Policy that defines Password as the only factor required for authentication
    And the Application Sign on Policy is set to "Password + Another Factor"
    And a user named "Mary"

  Scenario: Mary logs in with a Okta OIDC IDP and gets an error message
    Given Mary navigates to the Login View
    When she clicks the "Login with Okta OIDC IDP" button
    And logs in to Okta OIDC IDP
    # And the remediation returns "MFA_REQUIRED"
    # Then she should see an error message "Multifactor Authentication and Social Identity Providers is not currently supported, Authentication failed."   
