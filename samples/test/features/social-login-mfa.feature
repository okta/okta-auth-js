Feature: Direct Auth Social Login with MFA
  
  Background:
    Given a SPA, WEB APP or MOBILE Policy that defines Password as the only factor required for authentication
    # And a configured IDP object for Facebook
    # And an IDP routing rule defined to allow users in the Sample App to use the IDP
      And the Application Sign on Policy is set to "Password + Another Factor"
    And a user named "Mary"
    # And Mary does not have an account in the org

  Scenario: Mary logs in with a social IDP and gets an error message
    Given Mary navigates to Basic Social Login View
    When she clicks the "Login with Facebook" button
    And logs in to Facebook
    # And the remediation returns "MFA_REQUIRED"
    Then she should see an error message "Multifactor Authentication and Social Identity Providers is not currently supported, Authentication failed." 
  
Scenario: Mary Logs in with Social IDP
    Given Mary navigates to the Login View
    When she clicks the "Login with Facebook" button
      And logs in to Facebook
    Then she is redirected to the Root View
      And an application session is created
