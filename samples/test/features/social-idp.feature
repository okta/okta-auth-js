Feature: Direct Auth with Self Hosted Sign In Widget Social Login with 1 Social IDP

Background:
  Given an App
    And the app is assigned to "Everyone" group
    And a Policy that defines "Authentication"
    And with a Policy Rule that defines "Password as the only factor"
    # And a prefined user Mary with an active account
    # And Okta OIDC IdP predefined
    # And an IDP routing rule defined to allow users in the Sample App to use the IDP

Scenario: Mary Logs in with Okta OIDC IDP
  When she clicks the "login" button
  Then she is redirected to the "Login" page
  When she clicks the Login with Okta OIDC IDP button
    And logs in to Okta OIDC IDP
  Then she is redirected to the Root View
    And she sees a table with her profile info
    And the cell for the value of "email" is shown and contains her "email"