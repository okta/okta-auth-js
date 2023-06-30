#!/bin/bash -e

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
for f in $(ls $DIR/utils); do source $DIR/utils/$f; done

# if running on bacon
if [ -n "${TEST_SUITE_ID}" ]; then
  # Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
  # This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
  # DO NOT MERGE ANY CHANGES TO THIS LINE!!
  export WIDGET_VERSION=""

  # Add yarn to the $PATH so npm cli commands do not fail
  export PATH="${PATH}:$(yarn global bin)"
  # Install required node version
  export NVM_DIR="/root/.nvm"

  setup_service node "${1:-v14.18.0}"
  # Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
  setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt
else
  # bacon defines OKTA_HOME and REPO, define these relative to this file
  export OKTA_HOME=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd)
  export REPO="."
  export TEST_SUITE_TYPE_FILE=/dev/null
  export TEST_RESULT_FILE_DIR_FILE=/dev/null

  ### (known) Bacon exit codes
  # success
  export SUCCESS=0
  export PUBLISH_TYPE_AND_RESULT_DIR=0
  export PUBLISH_TYPE_AND_RESULT_DIR_BUT_SUCCEED_IF_NO_RESULTS=0
  # failure
  export FAILURE=1
  export FAILED_SETUP=1
  export TEST_FAILURE=1
  export PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL=1
  export PUBLISH_ARTIFACTORY_FAILURE=1

  # bacon commands
  get_vault_secret_key () {
    # ensures the env var is set
    if [ -z "$(echo "$3")" ]; then
      echo "$3 is not defined. Exiting..."
      exit 1
    fi
  }

  junit () {
    echo 'noop'
  }

  create_log_group () {
    set +x
    echo "~*~*~~*~*~ $1 ~*~*~~*~*~ "
    set -x
  }

  finish_log_group () {
    set +x
    echo "~*~*~~*~*~ *~*~* ~*~*~~*~*~"
    set -x
  }

  set -x  # when running locally, might as well see all the commands being ran
fi

cd ${OKTA_HOME}/${REPO}

create_log_group "Yarn Install"
# Install dependencies. --ignore-scripts will prevent chromedriver from attempting to install
if ! yarn install --frozen-lockfile --ignore-scripts; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
finish_log_group $?

npm_siw_install () {
  if ! yarn add -DW --force --ignore-scripts @okta/okta-signin-widget@${WIDGET_VERSION} ; then
    echo "WIDGET_VERSION could not be installed via npm: ${WIDGET_VERSION}"
    exit ${FAILED_SETUP}
  fi
}

verify_workspace_versions () {
  PKG=$1

  onError () {
    echo "ADDITIONAL WIDGET INSTALL DETECTED (check $1)"
    yarn why $PKG
    exit ${FAILED_SETUP}
  }

  LOCAL_INSTALLS=$(find . -type d -path "*/node_modules/$PKG" | wc -l)
  if [ $LOCAL_INSTALLS -gt 1 ]
  then
    onError 1
  fi
}

if [ ! -z "$WIDGET_VERSION" ]; then
  create_log_group "Beta SIW Install"
  echo "Installing WIDGET_VERSION: ${WIDGET_VERSION}"

  SHA=$(echo $WIDGET_VERSION | cut -d "-" -f 2)
  # cut -d "-" ran on '7.0.0' returns '7.0.0', ensure a SHA exists on the version string
  if [ "$WIDGET_VERSION" = "$SHA" ]; then
    # no sha found, install from npm
    INSTALLED_VERSION=$(npm_siw_install)
    install_beta_pkg @okta/okta-signin-widget "$INSTALLED_VERSION"
  else
    # sha found, install from artifactory
    install_siw_platform_scripts
    use_beta_pkg @okta/okta-signin-widget "$WIDGET_VERSION"
    install_artifact @okta/okta-signin-widget "$WIDGET_VERSION"
  fi

  verify_workspace_versions @okta/okta-signin-widget
  echo "WIDGET_VERSION installed: ${WIDGET_VERSION}"
  finish_log_group $?
fi

create_log_group "Yarn Build"
if ! yarn build; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi
finish_log_group $?
