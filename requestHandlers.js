var omx = require('omxcontrol');
var fs = require('fs');
var radioOn = true;

function start(url, args) {
  console.log("Request handler 'start' was called.");
	omx.start(url, (args === undefined ? '' : args), function() { } );
}

function stop() {
	console.log("Request handler 'stop' was called.");
  omx.stop(function() {});
}

function play(path) {
	console.log("Request handler 'play' was called.");
	omx.start(path, '--vol -300', function() { } );
}

function playvid(path) {
	console.log("Request handler 'playvid' was called.");
	omx.start(path, '--win "0 0 719 575"', function() { } );
}

function pause() {
	console.log("Request handler 'pause' was called.");
	omx.pause(function() { console.log('pause executed'); });
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
exports.playvid = playvid;
exports.playdir = playdir;
exports.pause = pause;