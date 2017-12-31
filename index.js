var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/start"] = requestHandlers.start;
handle["/stop"] = requestHandlers.stop;

server.start(router.route, handle);
