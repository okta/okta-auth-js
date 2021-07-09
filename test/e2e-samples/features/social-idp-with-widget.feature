Feature: Direct Auth with Self Hosted Sign In Widget Social Login with 1 Social IDP

  Background:
	  Given a SPA, WEB APP or MOBILE Policy that defines Password as the only factor required for authentication
	  #And a configured IDP object for Facebook
	  #And an IDP routing rule defined to allow users in the Sample App to use the IDP
	  #And a user named "Mary"
	  #And Mary does not have an account in the org

  Scenario: Mary Logs in with Social IDP
	  Given Mary navigates to Login with Social IDP
	  When she clicks the "Login with Facebook" button in the embedded Sign In Widget
	  And logs in to Facebook
	  Then she is redirected back to the Sample App
