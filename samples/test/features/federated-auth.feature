Feature: Federated Authentication

  Scenario: Redirect to Okta for authentictaion
    Given Login button is displayed 
    When User clicks the login button
    Then Browser is redirected to the Okta-hosted login page
    When User enters usernaame
    And User enters password
    And User clicks login
    Then Browser is redirected to the app
    And User can verify their profile data