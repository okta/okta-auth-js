Feature: Direct Auth

  Scenario Outline: As a user, I can authenticate by providing my username and password

    Given I am on the home page
    When I login with <username> and <password>
    Then I should see an error message saying <message>

    Examples:
      | username | password             | message                        |
      | foobar   | barfoo               | Your username is invalid!      |
