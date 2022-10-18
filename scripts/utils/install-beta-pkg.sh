#!/bin/bash

if [ -z "$1" ]; then
  echo "\`package name\` was not supplied. Exiting..."
  exit 1
fi

if [ -z "$2" ]; then
  echo "\`version\` was not supplied. Exiting..."
  exit 1
fi

PKG=$1
VERSION=$2

replace_workspace_version () {
  # $1 = workspace path
  # #2 = package name
  # $3 = version
  json=$(cat $1/package.json |  jq --arg pkg $2 --arg version $3 'if 
      .dependencies | has("\($pkg)") then .dependencies["\($pkg)"] = $version
    elif
      .devDependencies | has("\($pkg)") then .devDependencies["\($pkg)"] = $version
    else . end') && \
  printf '%s\n' "${json}" > $1/package.json
}

replace_version () {
  # $1 = workspace path
  # #2 = package name
  # $3 = version
  ws=$1
  pkg=$2
  ver=$3

  echo $1
  replace_workspace_version $1 $2 $3
}

workspaces=$(yarn -s workspaces info | jq 'map(..|objects|select(.location).location)[1:] | @sh' | tr -d \'\")

# replace_version . $PKG $VERSION   # run on toplevel workspace
for ws in $workspaces
do
  replace_version $ws $PKG $VERSION
done
yarn --ignore-scripts
