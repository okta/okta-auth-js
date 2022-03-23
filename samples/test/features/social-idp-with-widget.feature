Feature: Direct Auth with Self Hosted Sign In Widget Social Login with 1 Social IDP

  Background:
		Given an App
    	And the app is assigned to "Everyone" group
    	And a Policy that defines "Authentication"
    	And with a Policy Rule that defines "Password as the only factor"
			
#  Scenario: Mary Logs in with Social IDP
#	  Given Mary navigates to Login with Social IDP
#	  When she clicks the "Login with Facebook" button in the embedded Sign In Widget
#	  And logs in to Facebook
#	  Then she is redirected back to the Sample App

  Scenario: Mary Logs in with Okta OIDC IDP
	  Given Mary navigates to Login with Okta OIDC IDP
	  When she clicks the "Login with Okta OIDC IDP" button in the embedded Sign In Widget
	  And logs in to Okta OIDC IDP
	  Then she is redirected back to the Sample App
