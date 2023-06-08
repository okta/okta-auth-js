#!/bin/bash

source $(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)/foreach_workspace.sh

# determine if script is being invoked or sourced
(return 0 2>/dev/null) && sourced=1 || sourced=0

replace_workspace_version () {
  # $1 = workspace path
  # $2 = package name
  # $3 = version
  json=$(cat $1/package.json |  jq --arg pkg $2 --arg version $3 'if 
      .dependencies | has("\($pkg)") then .dependencies["\($pkg)"] = $version
    elif
      .devDependencies | has("\($pkg)") then .devDependencies["\($pkg)"] = $version
    else . end') && \
  printf '%s\n' "${json}" > $1/package.json
}

replace_workspace_dev_version () {
  # $1 = workspace path
  # $2 = package name
  # $3 = version
  # package should be moved to `devDependencies` cause `siw-platform` uses `--dev`
  json=$(cat $1/package.json |  jq --arg pkg $2 --arg version $3 '
    if  .dependencies | has("\($pkg)") then
     del(.dependencies["\($pkg)"]) | .devDependencies["\($pkg)"] = $version
    elif .devDependencies | has("\($pkg)") then
     .devDependencies["\($pkg)"] = $version
    else . end') && \
  printf '%s\n' "${json}" > $1/package.json
}

has_package () {
  # $1 = workspace path
  # $2 = package name
  result=$(cat $1/package.json | jq --arg pkg $2 '
    (.devDependencies | has("\($pkg)")) or (.dependencies | has("\($pkg)"))
  ')
  [[ "$result" == "true" ]]
}

install_artifact () {
  # $1 = workspace path
  # $2 = package name
  # $3 = version
  if has_package $1 $2; then
    replace_workspace_dev_version $1 $2 $3
    if ! siw-platform install-artifact -e ${SIW_PLATFORM_ENV} -n $2 -v $3 ; then
      echo "$2 could not be installed via siw-platform: $3"
      exit ${FAILED_SETUP}
    fi
  fi
}

install_beta_pkg () {
  # $1 = package name
  # $2 = version
  foreach_workspace -p replace_workspace_version $1 $2
  yarn --ignore-scripts
}

install_artifact_in_workspaces () {
  # $1 = package name
  # $2 = version
  foreach_workspace -p install_artifact $1 $2
}

if [ $sourced -ne 1 ]; then
  if [ -z "$1" ]; then
    echo "\`package name\` was not supplied. Exiting..."
    exit 1
  fi

  if [ -z "$2" ]; then
    echo "\`version\` was not supplied. Exiting..."
    exit 1
  fi

  install_beta_pkg $1 $2
fi

# workspaces=$(yarn -s workspaces info | jq 'map(..|objects|select(.location).location)[1:] | @sh' | tr -d \'\")

# # replace_version . $PKG $VERSION   # run on toplevel workspace
# for ws in $workspaces
# do
#   replace_version $ws $PKG $VERSION
# done
# yarn --ignore-scripts
