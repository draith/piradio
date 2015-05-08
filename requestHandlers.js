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
	omx.start(path, '--vol 300', function() { } );
}

function pause() {
	console.log("Request handler 'pause' was called.");
	omx.pause(function() { console.log('pause executed'); });
}

function prevch() {
	console.log("Request handler 'prevch' was called.");
	omx.prevch(function() { console.log('prevch executed'); });
}

function nextch() {
	console.log("Request handler 'nextch' was called.");
	omx.nextch(function() { console.log('nextch executed'); });
}

function back30s() {
	console.log("Request handler 'back30s' was called.");
	omx.back30s(function() { console.log('back30s executed'); });
}

function fwd30s() {
	console.log("Request handler 'fwd30s' was called.");
	omx.fwd30s(function() { console.log('fwd30s executed'); });
}

function back10m() {
	console.log("Request handler 'back10m' was called.");
	omx.back10m(function() { console.log('back10m executed'); });
}

function fwd10m() {
	console.log("Request handler 'fwd10m' was called.");
	omx.fwd10m(function() { console.log('fwd10m executed'); });
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
exports.prevch = prevch;
exports.nextch = nextch;
exports.back30s = back30s;
exports.fwd30s = fwd30s;
exports.back10m = back10m;
exports.fwd10m = fwd10m;
exports.playvid = playvid;
exports.playdir = playdir;
exports.pause = pause;
