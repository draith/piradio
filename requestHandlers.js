var omx = require('omx-manager');
var fs = require('fs');
var radioOn = true;

function start(url, args) {
  console.log("Request handler 'start' was called.");
	omx.play(url);
}

function stop() {
	console.log("Request handler 'stop' was called.");
  omx.stop();
}

function play(path) {
	console.log("Request handler 'play' was called.");
	omx.play(path,{'-o': 'local', '--vol': '-300'});
}

function playvid(path) {
	console.log("Request handler 'playvid' was called.");
	omx.play(path,{'-o': 'local', '--vol': '300'});
}

function pause() {
	console.log("Request handler 'pause' was called.");
	omx.pause();
}

function prevch() {
	console.log("Request handler 'prevch' was called.");
	omx.previousChapter();
}

function nextch() {
	console.log("Request handler 'nextch' was called.");
	omx.nextChapter();
}

function back30s() {
	console.log("Request handler 'back30s' was called.");
	omx.seekBackward();
}

function fwd30s() {
	console.log("Request handler 'fwd30s' was called.");
	omx.seekForward();
}

function back10m() {
	console.log("Request handler 'back10m' was called.");
	omx.seekFastBackward();
}

function fwd10m() {
	console.log("Request handler 'fwd10m' was called.");
	omx.seekFastForward();
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
	omx.play(plist,{'-o': 'local', '--vol': '-300'});
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
