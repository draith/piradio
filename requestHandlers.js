var omx = require('omxcontrol');

function start(url, vol) {
  console.log("Request handler 'start' was called.");
	omx.start(url, (vol === undefined ? '' : '--vol ' + vol), function() { } );
}

function stop() {
	console.log("Request handler 'stop' was called.");
  omx.stop(function() {});
}

exports.start = start;
exports.stop = stop;
