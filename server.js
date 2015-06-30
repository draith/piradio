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

// Populates trackNames as map from filename to track title,
// from id3v2 output.
function parseID3(id3Output) {
	var lines = id3Output.split('\n');
	var filename = false;
	trackNames = [];
	var i;
	for (i = 0; i < lines.length; i++)
	{
		// Get filename from Filename value.
		if (/^Filename: /.test(lines[i]))
		{
			filename = lines[i].substr(10);
		}
		// Get track name from TIT2 value.
		else if (filename && /^TIT2: /.test(lines[i]))
		{
			var j = 0;
			var trackName = lines[i].substr(6);
			// id3v2 doesn't output non-ASCII tracknames correctly - it masks out
			// bit 8, resulting in ASCII-fied track names.
			// Workaround: If the filename contains non-ASCII characters, 
			// and the returned trackname is found in the ASCII-fied filename,
			// then use the corresponding part of the (non-ASCII) filename as
			// the track name.
			var asciiFilename = '';
			for (j = 0; j < filename.length; j++)
			{
				asciiFilename = asciiFilename + String.fromCharCode(filename.charCodeAt(j) & 0x7f);
			}
			if (asciiFilename != filename)
			{
				// filename must contain non-ASCII characters..
				var trackNameOffset = asciiFilename.indexOf(trackName);
				if (trackNameOffset >= 0)
				{
					trackName = filename.substr(trackNameOffset,trackName.length);
				}
			}
			trackNames[filename] = trackName;
		}
	}
}

function start(route, handle) {
	function finishLibPage(response) {
		// Display directory links...
		response.write("<p><a href = './radio'>Radio stations</a>");
		if (musicpath != musicroot)
		{
			// Link to musicroot..
			response.write("<a href = './library'>Files</a>");
			if (musicpath != rootpath)
			{
				// Not in root - link to parent directory
				response.write(libLink('..'));
				console.log('musicpath = ' + musicpath);
			}
			// Write title of current directory
			var dirName = musicpath.substr(musicpath.lastIndexOf('/')+1);
			response.write('<p class="title">' + dirName + '</p>');
		}
		// Display contents of current directory in scrolling div.
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

  // Display title and hyperlink(s) for one item in current directory.
  function libLink(path) {
	  var stat = fs.statSync(musicpath + "/" + path);
	  if (stat.isDirectory())
	  {
		  // Display directory link(s)
		  var pathName = path;
		  if (path == '..')
		  {
			  // Parent directory - will display its name instead of '..'
			  pathName = fs.realpathSync(musicpath + '/' + path);
			  pathName = pathName.substr(pathName.lastIndexOf('/')+1);
		  }
		  // Display directory name in hyperlink to 'cd' to that directory.
		  var result = '<p><a href="./cd?dir=' + encodeURIComponent(path) + '">' + pathName + '</a>';
		  // Check for any mp3 files in the directory...
		  var files = fs.readdirSync(musicpath + '/' + path);
 		  for (j = 0; j < files.length; j++)
		  {
			  // If any, include a 'playdir' link, to play all of them.
			if (/\.mp3$/.test(files[j])) {
				result += '<a href="./playdir?dir=' + encodeURIComponent(path) + '"> (Play)</a>';
				break;
			} 
		  }
		  return result;
	  }
	  else if (/\.mp3$/.test(path))
	  {
		  // MP3 file: display track name (or filename if none) in 'play' hyperlink.
		  return '<p><a href="./play?file=' + encodeURIComponent(path) + '">' + 
					(trackNames[musicpath + '/' + path] || path) + '</a>';
	  }
	  else if (/\.mpg$/.test(path))
	  {
		  // MPG file - extract title from filename format..
		  var progName = path.substr(path.lastIndexOf('_')+1);
		  return '<p><a href="./playvid?file=' + encodeURIComponent(path) + '">' + 
					progName + '</a>';
	  }
	  else if (/\.mp4$/.test(path))
	  {
		  // MP4 file - display filename.
		  return '<p><a href="./playvid?file=' + encodeURIComponent(path) + '">' + 
					path + '</a>';
	  }
	  else return ""; 
  }
  
  // escape path for passing to id3v2 as command-line parameter.
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
		// Catch-all..
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
			var prevpath = musicpath;
			musicpath = fs.realpathSync(musicpath + '/' + decodeURIComponent(requestURL.query.dir));
			if (prevpath == musicroot)
			{
				rootpath = musicpath;
			}
			// Get id3 tags
			var cmd = "id3v2 -R " + escaped(musicpath) + "/*.mp3";
			exec(cmd, { timeout: 5000 },
				function (error, stdout, stderr) {
					// Get title tags for display
					parseID3(stdout);
					finishLibPage(response);
				}
			);
		}
		else {
			// Just refresh the page.
			finishLibPage(response);
		}
	}
  }
  http.createServer(onRequest).listen(8888);
  console.log("Server started.");
}

exports.start = start;
