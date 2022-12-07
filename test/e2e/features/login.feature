Feature: Direct Auth

  Scenario Outline: As a user, I can authenticate by providing my username and password

    Given Mary is on the default view in an UNAUTHENTICATED state
    When she logins with <username> and <password>
    Then she should see an error message saying <message>

    Examples:
      | username | password             | message                        |
      | foobar   | barfoo               | Your username is invalid!      |
