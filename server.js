var http = require("http");
var url = require("url");
var fs = require("fs");
var index;
var queries;
var station;
var selectedIndex;
var stations = require("./stations");
var musicpath = "/home/pi/Downloads/Music";
var radio = true;

function start(route, handle) {
	// Request handler callback
  function onRequest(request, response) {
	var requestURL = url.parse(request.url,true);
    var pathname = requestURL.pathname;
    console.log("Request for path " + pathname + " received.");
    selectedIndex = requestURL.query.index;
    console.log("index: ", requestURL.query.index );
    if (selectedIndex === undefined) {
		route(handle, pathname);
	}
	else
	{
		// Pass station info to router for supplied index
		station = stations.list[selectedIndex];
		route(handle, pathname, station.url, station.vol);
	}
    // (re-)display web page
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(fs.readFileSync('pagetop.html'));
	if (radio) {
    for (index = 0; index < stations.list.length; index++) {
		// link for each radio station
		response.write("<p><a ");
		if (index == selectedIndex) {
			response.write("class = 'playing' ");
		}
		response.write("href = './start?index=" + index + "'>" + stations.list[index].name + "</a>");
	}
	} // radio

    response.write(fs.readFileSync('pagebot.html'));
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server started.");
}

exports.start = start;
