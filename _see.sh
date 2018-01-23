#!/bin/bash
unset TMUX
test -e /tmp/srv
OUT=$?

if [ $OUT -eq 0 ]; then
	tmux -S /tmp/srv attach -t srvScreen -r
else
        echo "Bot not active"
fi
