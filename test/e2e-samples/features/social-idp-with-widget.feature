Feature: Direct Auth with Self Hosted Sign In Widget Social Login with 1 Social IDP

  Background:
		Given an App that assigned to a test group
			And the app is assigned to "Everyone" group
    	And a Policy that defines "Authentication"
    	And with a Policy Rule that defines "Password as the only factor"
			And a predefined user named Mary with an account in the org
		
  Scenario: Mary Logs in with Okta OIDC IDP
		When she clicks the "login" button
		Then she is redirected to the "Embedded Widget" page
	  When she clicks the "Login with Okta OIDC IDP" button in the embedded Sign In Widget
	  	And logs in to Okta OIDC IDP
	  Then she is redirected to the "Root" page
