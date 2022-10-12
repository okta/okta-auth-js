#!/bin/bash

# run () {
# 	echo 'foo'
# 	exit 1
# }

# echo 'prerun'
# run
# echo 'postrun'

 get_secret () {
	echo $2
	if [ -n ${!2} ]; then
		echo 'worked'
	fi
}

# get_secret foo bar

# echo $(dirname -- $0)
# cd $(dirname -- $0)/../.
# echo $(pwd)

export SUCCESS=0
