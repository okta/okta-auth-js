Feature: Root page for Direct Auth Demo Application

  Background:

    Scenario: Mary logs out of the app
      Given Mary has an authentcation session
        And navigates to the Root View
      When Mary clicks the logout button
      Then her access token is revoked
        # And her app session is destroyed
        # And she is redirected back to the Root View
