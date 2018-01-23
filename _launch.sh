#!/bin/bash
unset TMUX
test -e /tmp/srv
OUT=$?

if [ $OUT -eq 0 ]; then
	echo "Bot already up, use see-bot.sh to hook up the console."
else
	tmux -S /tmp/srv new-session -Ad -s srvScreen 'nodejs init_bot.js'
	chgrp devs /tmp/srv
	echo "Bot launched - use _see.sh to connect to the console"
fi
