# piradio
Node.js-based web application for the Raspberry Pi to play streamed audio and music files, under browser control.

This uses a variant of the omxcontrol module at https://github.com/rikkertkoppes/omxcontrol, to drive omxplayer
from a browser interface.

NOTE:  Won't work properly (stopping/multi-track play) unless stdin is /dev/null.
(To run interactively for test/debug: 'node index.js < /dev/null')

To Do:
More interactive browser interface.
Skip forward/backward in album/directory.

Dependencies: 
id3v2 : for extracting and displaying track names in music library.

NODE.JS modules:
http:  Web server functionality.
fs:    File system access (for music library)
child_process: To execute shell commands (omxplayer, id3v2, etc.)
url:   To parse URIs from browser.
