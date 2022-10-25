#!/bin/bash

# useage: foreach_workspace [-p] cmd ...args
#   -p : passes the workspace path as the first arg to `cmd``
#   cmd: the command to be executed in each workspace
#   args: additional arguments that will be passed to `cmd`
# examples:
#   ./scripts/utils/foreach_workspace.sh -p "echo" "foo"
#       <path of workspace> foo
#   ./scripts/utils/foreach_workspace.sh "pwd"
#       <path of workspace>

# determine if script is being invoked or sourced
(return 0 2>/dev/null) && sourced=1 || sourced=0

# project directory
pdir=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/../.." &> /dev/null && pwd)

foreach_workspace () {

  exec_cmd () {
    # $1 = workspace path
    # $2 = command OR flag
    # $3 = command OR args

    if [[ "$2" == "-p" ]]; then
      $3 $1 ${@:4}
    else
      $2 ${@:3}
    fi
  }

  # gets list of all workspace directory relative to project directory
  workspaces=$(yarn -s workspaces info | jq 'map(..|objects|select(.location).location) | map("./" + .) | @sh' | tr -d \'\")

  for ws in $workspaces
  do
    pushd $pdir/$ws > /dev/null
    name=$(jq '.name' ./package.json)
    echo ">>> $name ($ws)"
    exec_cmd $pdir/$ws "$@"
    popd > /dev/null
  done
}

if [ $sourced -ne 1 ]; then
  foreach_workspace "$@"
fi