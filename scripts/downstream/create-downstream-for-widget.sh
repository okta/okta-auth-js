#!/bin/bash

# download okta-signin-widget artifact version if empty and assign to upstream_artifact_version
if [[ -z "${upstream_artifact_version}" ]]; then
  pushd ${OKTA_HOME}/okta-signin-widget > /dev/null
    download_job_data global artifact_version upstream_artifact_version okta-signin-widget ${upstream_artifact_sha}
  popd > /dev/null
  echo "okta-signin-widget version that will be tested: ${upstream_artifact_version}"
fi

pushd ${OKTA_HOME}/okta-auth-js/scripts > /dev/null

# Get the WIDGET_VERSION version to use
WIDGET_VERSION="$(echo ${upstream_artifact_version} | cut -d'@' -f3)"

# Update setup script
echo "Update okta-signin-widget version in scripts/setup.sh to ${WIDGET_VERSION}"
sed -i "s/\(WIDGET_VERSION\=\).*/\1\"${WIDGET_VERSION}\"/g" setup.sh

popd > /dev/null
