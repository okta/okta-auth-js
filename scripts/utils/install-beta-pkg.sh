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

install_beta_pkg () {
  # $1 = package name
  # $2 = version
  foreach_workspace -p replace_workspace_version $1 $2
  yarn --ignore-scripts
}

use_beta_pkg () {
  # $1 = package name
  # $2 = version
  foreach_workspace -p replace_workspace_version $1 $2
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
