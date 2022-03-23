Feature: Direct Auth with Self Hosted Sign In Widget Social Login with 1 Social IDP

Background:
  Given an App
    And the app is assigned to "Everyone" group
    And a Policy that defines "Authentication"
    And with a Policy Rule that defines "Password as the only factor"
    # And Okta OIDC IdP predefined
    # And an IDP routing rule defined to allow users in the Sample App to use the IDP
	
# Scenario: Mary Logs in with Social IDP
#    Given Mary navigates to the Login View
#    When she clicks the "Login with Facebook" button
#      And logs in to Facebook
#    Then she is redirected to the Root View
#      And an application session is created

Scenario: Mary Logs in with Okta OIDC IDP
    Given Mary navigates to the Login View
    When she clicks the "Login with Okta OIDC IDP" button
      And logs in to Okta OIDC IDP
    Then she is redirected to the Root View
      And an application session is created