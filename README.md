# piradio
Node.js-based web application for the Raspberry Pi to play internet radio stations, under browser control.

This uses a variant of the omxcontrol module at https://github.com/rikkertkoppes/omxcontrol, to drive omxplayer
from a browser interface.

NODE.JS modules:
http:  Web server functionality.
fs:    File system access (for music library)
child_process: To execute shell commands (omxplayer, id3v2, etc.)
url:   To parse URIs from browser.

To run on startup, add the following line to /etc/rc.local :
nohup su pi -c 'cd ~/piradio && node index.js > /dev/null 2> piradio.err' &
