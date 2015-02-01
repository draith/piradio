var omx = require('omxcontrol');
var fs = require('fs');
var radioOn = true;

function start(url, vol) {
  console.log("Request handler 'start' was called.");
	omx.start(url, (vol === undefined ? '' : '--vol ' + vol), function() { } );
}

function stop() {
	console.log("Request handler 'stop' was called.");
  omx.stop(function() {});
}

function play(path) {
	console.log("Request handler 'play' was called.");
	omx.start(path, '--vol -300', function() { } );
}

function playdir(path) {
	console.log("Request handler 'playdir' was called.");
	var files = fs.readdirSync(path);
	var plist = [];
	for (i = 0; i < files.length; i++)
	{
		if (/\.mp3$/.test(files[i])) {
			plist[plist.length] = path + '/' + files[i];
		}
	}
	omx.play_list(plist, '--vol -300');
}

exports.start = start;
exports.stop = stop;
exports.play = play;
exports.playdir = playdir;