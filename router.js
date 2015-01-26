function route(handle, pathname, url, vol) {
  if (pathname != '/favicon.ico')
  {
    console.log("About to route a request for " + pathname);
    if (typeof handle[pathname] === 'function') {
      handle[pathname](url, vol);
    } else {
      console.log("No request handler found for " + pathname);
    }
  }
}

exports.route = route;

  
