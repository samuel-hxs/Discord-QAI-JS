#!/bin/bash
#unset TMUX
#tmux has-session -t srvScreen > /dev/null 2>&1
#OUT=$?

#if [ $OUT -eq 0 ]; then
        tmux -S /tmp/srv kill-session -t srvScreen > /dev/null 2>&1
	rm /tmp/srv > /dev/null 2>&1
	killall nodejs > /dev/null 2>&1
	echo "Socket cleared - bot killed, if any"
#else
 #       echo "Nothing to kill"
#fi


