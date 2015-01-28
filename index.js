var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/start"] = requestHandlers.start;
handle["/stop"] = requestHandlers.stop;
handle["/play"] = requestHandlers.play;
handle["/playdir"] = requestHandlers.playdir;

server.start(router.route, handle);
