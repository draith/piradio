var http = require("http");
var url = require("url");
var fs = require("fs");
var index;
var queries;
var station;
var selectedIndex;
var stations = require("./stations");
var musicpath = "/home/pi/library";
var musicroot = musicpath;
var rootpath;
var radio = true;
var child_process = require('child_process');
var exec = child_process.exec;
var trackNames = [];

function parseID3(id3Output) {
	var lines = id3Output.split('\n');
	var filename = false;
	trackNames = [];
	var i;
	for (i = 0; i < lines.length; i++)
	{
		if (/^Filename: /.test(lines[i]))
		{
			filename = lines[i].substr(10);
		}
		else if (filename && /^TIT2: /.test(lines[i]))
		{
			trackNames[filename] = lines[i].substr(6);
		}
	}
}

function start(route, handle) {
	
	function finishLibPage(response) {
		response.write("<p><a href = './radio'>Radio stations</a>");
		if (musicpath != musicroot)
		{
			response.write("<a href = './library'>Files</a>");
			if (musicpath != rootpath)
			{
				response.write(libLink('..'));
				console.log('musicpath = ' + musicpath);
			}
			var dirName = musicpath.substr(musicpath.lastIndexOf('/')+1);
			response.write('<p class="title">' + dirName + '</p>');
		}
		response.write('</div>\n<div id=scrolling>');
		var files = fs.readdirSync(musicpath);
		for (i = 0; i < files.length; i++)
		{
			response.write(libLink(files[i]));
		}
		response.write('</div>');
		response.write(fs.readFileSync('pagebot.html'));
		response.end();
	}

  function libLink(path) {
	  var stat = fs.statSync(musicpath + "/" + path);
	  if (stat.isDirectory())
	  {
		  var pathName = path;
		  if (path == '..')
		  {
			  pathName = fs.realpathSync(musicpath + '/' + path);
			  pathName = pathName.substr(pathName.lastIndexOf('/')+1);
		  }
		  var result = '<p><a href="./cd?dir=' + encodeURIComponent(path) + '">' + pathName + '</a>';
		  var files = fs.readdirSync(musicpath + '/' + path);
 		  for (j = 0; j < files.length; j++)
		  {
			if (/\.mp3$/.test(files[j])) {
				result += '<a href="./playdir?dir=' + encodeURIComponent(path) + '"> (Play)</a>';
				break;
			} 
		  }
		  return result;
	  }
	  else if (/\.mp3$/.test(path))
	  {
		  return '<p><a href="./play?file=' + encodeURIComponent(path) + '">' + 
					(trackNames[musicpath + '/' + path] || path) + '</a>';
	  }
	  else if (/\.mpg$/.test(path) || /\.mp4$/.test(path))
	  {
		  var progName = path.substr(path.lastIndexOf('_')+1);
		  return '<p><a href="./playvid?file=' + encodeURIComponent(path) + '">' + 
					progName + '</a>';
	  }
	  else return ""; 
  }
  
  function escaped(path)
  {
	  return path.replace(/([ &'\(\)])/g, "\\$1");
  }
	// Request handler callback
  function onRequest(request, response) {
	var requestURL = url.parse(request.url,true);
    var pathname = requestURL.pathname;
    selectedIndex = requestURL.query.index;
	if (pathname == '/library') {
		radio = false;
		musicpath = musicroot;
	}
	else if (pathname == '/radio') {
		radio = true;
	}
	else if (pathname == '/play' || pathname == '/playvid') {
		console.log('query.file = ' + requestURL.query.file);
		route(handle, pathname, musicpath + "/" + decodeURIComponent(requestURL.query.file));
	}
	else if (pathname == '/playdir') {
		route(handle, pathname, musicpath + "/" + decodeURIComponent(requestURL.query.dir));
	}
    else if (selectedIndex === undefined) {
		// Catchall..
		route(handle, pathname);
	}
	else // '/start' 
	{
		// Pass station info to router for supplied index
		station = stations.list[selectedIndex];
		route(handle, pathname, station.url, station.vol);
	}
    // (re-)display web page
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(fs.readFileSync('pagetop.html'));
	if (radio) {
		response.write("<p><a href = './library'>Files</a>");
		response.write('</div>\n<div id=scrolling>');
		for (index = 0; index < stations.list.length; index++) {
			// link for each radio station
			response.write("<p><a ");
			if (index == selectedIndex) {
				response.write("class = 'playing' ");
			}
			response.write("href = './start?index=" + index + "'>" + stations.list[index].name + "</a>");
		}
		response.write('</div>');
		response.write(fs.readFileSync('pagebot.html'));
		response.end();
	} // radio
	else
	{	// music library
		if (pathname == '/cd') {
			console.log('/cd :' + requestURL.query.dir);
			var prevpath = musicpath;
			musicpath = fs.realpathSync(musicpath + '/' + decodeURIComponent(requestURL.query.dir));
			console.log('musicpath = ' + musicpath);
			if (prevpath == musicroot)
			{
				rootpath = musicpath;
				console.log('rootpath = ' + rootpath);
			}
			// Get id3 tags
			var cmd = "id3v2 -R " + escaped(musicpath) + "/*.mp3";
			console.log('ID3 command ' + cmd);
			exec(cmd, { timeout: 2000 },
				function (error, stdout, stderr) {
					// Get title tags for display
					parseID3(stdout);
					finishLibPage(response);
				}
			);
		}
		else {
			finishLibPage(response);
		}
	}
  }
  http.createServer(onRequest).listen(8888);
  console.log("Server started.");
}

exports.start = start;
