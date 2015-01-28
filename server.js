var http = require("http");
var url = require("url");
var fs = require("fs");
var index;
var queries;
var station;
var selectedIndex;
var stations = require("./stations");
var musicpath = "/home/pi/Downloads/Music";
var musicroot = musicpath;
var radio = true;

function start(route, handle) {
  function libLink(path) {
	  var stat = fs.statSync(musicpath + "/" + path);
	  if (stat.isDirectory())
	  {
		  var result = '<p><a href="./cd?dir=' + path + '">' + path + '</a>';
		  var files = fs.readdirSync(musicpath + '/' + path);
 		  for (j = 0; j < files.length; j++)
		  {
			if (/\.mp3$/.test(files[j])) {
				result += '<a href="./playdir?dir=' + path + '"> (Play)</a>';
				break;
			} 
		  }
		  return result;
	  }
	  else if (/\.mp3$/.test(path))
	  {
		  return '<p><a href="./play?file=' + path + '">' + path + '</a>';
	  }
	  else return ""; 
  }
	// Request handler callback
  function onRequest(request, response) {
	var requestURL = url.parse(request.url,true);
    var pathname = requestURL.pathname;
    console.log("Request for path " + pathname + " received.");
    selectedIndex = requestURL.query.index;
    console.log("index: ", requestURL.query.index );
	if (pathname == '/library') {
		radio = false;
	}
	else if (pathname == '/radio') {
		radio = true;
	}
	else if (pathname == '/cd') {
		musicpath = fs.realpathSync(musicpath + '/' + requestURL.query.dir);
		console.log("musicpath = " + musicpath);
	}
	else if (pathname == '/play') {
		route(handle, pathname, musicpath + "/" + requestURL.query.file);
	}
	else if (pathname == '/playdir') {
		route(handle, pathname, musicpath + "/" + requestURL.query.dir);
	}
    else if (selectedIndex === undefined) {
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
		response.write("<p><a href = './library'>Music Library</a>");
	} // radio
	else
	{	// music library
		var files = fs.readdirSync(musicpath);
		if (musicpath != musicroot)
		{
			response.write(libLink('..'));
		}
		for (i = 0; i < files.length; i++)
		{
			response.write(libLink(files[i]));
		}
		response.write("<p><a href = './radio'>Radio stations</a>");
	}

    response.write(fs.readFileSync('pagebot.html'));
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server started.");
}

exports.start = start;
