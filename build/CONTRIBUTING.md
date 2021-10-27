# Contributing to Okta Open Source Repos

Thank you for your interest in contributing to Okta's Open Source Projects! Before submitting a PR, please take a moment to read over our [Contributer License Agreement](https://developer.okta.com/cla/). In certain cases, we ask that you [sign a CLA](https://developer.okta.com/sites/all/themes/developer/pdf/okta_individual_contributor_license_agreement_2016-11.pdf) before we merge your pull request.

- [Commit Message Guidelines](#commit-message-guidelines)
  * [Git Commit Messages](#git-commit-messages)
  * [Template](#template)
  * [Template for specific package change](#template-for-specific-package-change)
  * [Type](#type)
  * [Example](#example)
  * [Example for specific package change](#example-for-specific-package-change)
  * [Breaking changes](#breaking-changes)
  * [Example for a breaking change](#example-for-a-breaking-change)

## Commit Message Guidelines

### Git Commit Messages

We use an adapted form of [Conventional Commits](http://conventionalcommits.org/).

* Use the present tense ("Adds feature" not "Added feature")
* Limit the first line to 72 characters or less
* Add one feature per commit. If you have multiple features, have multiple commits.

### Template

    <type>: Short Description of Commit
    <BLANKLINE>
    More detailed description of commit
    <BLANKLINE>
    (Optional) Resolves: <Issue #>

### Template for specific package change

    <type>[<package-name>]: Short Description of Commit
    <BLANKLINE>
    More detailed description of commit
    <BLANKLINE>
    (Optional) Resolves: <Issue #>

### Type
Our types include:
* `feat` when creating a new feature
* `fix` when fixing a bug
* `test` when adding tests
* `refactor` when improving the format/structure of the code
* `docs` when writing docs
* `release` when pushing a new release
* `chore` others (ex: upgrading/downgrading dependencies)


### Example

    docs: Updates CONTRIBUTING.md

    Updates Contributing.md with new emoji categories
    Updates Contributing.md with new template

    Resolves: #1234

### Example for specific package change
    fix: Fixes bad bug

    Fixes a very bad bug in auth-js

    Resolves: #5678

### Breaking changes

* Breaking changes MUST be indicated at the very beginning of the body section of a commit. A breaking change MUST consist of the uppercase text `BREAKING CHANGE`, followed by a colon and a space.
* A description MUST be provided after the `BREAKING CHANGE:`, describing what has changed about the API.

### Example for a breaking change

    feat: Allows provided config object to extend other configs

    BREAKING CHANGE: `extends` key in config file is now used for extending other config files