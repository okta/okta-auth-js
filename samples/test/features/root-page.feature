Feature: Root page for Direct Auth Demo Application

  Background:

    Scenario: Mary visits the Root View WITHOUT an authentcation session (no tokens)
      Given Mary navigates to the Root View
      Then the Root Page shows links to the Entry Points
