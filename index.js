const handler = require('serve-handler')

const interpolate = require('./interpolater')
const {loop, getSubPages, getPage} = require('./forlooper')

const fs = require('fs')
const path = require('path')

const frameWork = (name) => {
	var infoOn = false
	var _routes = {}
	var _regexRoutes = {}
    var _baseRoute = './'
	var _name = 'unnamed_router' || name
	var _bodyUrl

	const matchesRegex = (route) => {
		const regexes = Object.keys(_regexRoutes);
		for (const regexString of regexes) {
			const pattern = regexString.slice(1, regexString.lastIndexOf('/'));
			const flags = regexString.slice(regexString.lastIndexOf('/') + 1);
			const regex = new RegExp(pattern, flags);
			if (new RegExp(regex).test(route)) {
				if(infoOn)console.log('route matches!', regex, _regexRoutes[regexString])
				return _regexRoutes[regexString]
			}
		}
		return false
	}
	
	const evaluate = (html, variables) => {
		var htmlWithSubPagesAndLoops = loop(html, variables || {})
		var htmlWithVariables = interpolate(htmlWithSubPagesAndLoops, variables || {})
		if (_bodyUrl) {
			htmlWithVariables = getPage(_bodyUrl, { body: htmlWithVariables })
		}
		var htmlWithSubPages = getSubPages(htmlWithVariables, variables || {})
		var finalHTML = interpolate(htmlWithSubPages, variables || {})
		return finalHTML
	}
	
	const fileRouter = (file, variables) => {

        var extention = file.split('.').pop()
        var filePath = path.join(_baseRoute, file)

        if (extention == 'html') {
            return (request, response) => {

                var html = fs.readFileSync(filePath).toString()
				const finalHtml = evaluate(html, variables)
                response.writeHead(200, { 'Content-Type': 'text/html' })
                response.end(finalHtml)
            }
        }
        else {
            return routesToFile = async (request, response) => {
				request.url = filePath
				await handler(request, response);
            }
        }
    }

	return {
		evaluate,
		fileRouter,
		setBody: (file) => {
            _bodyUrl = file
        },
		setInfoOn: (on) => {
            infoOn = on
        },
		addRoute: (url, resource, variables) => {
			if (typeof url === 'string') {
				url = url.toLocaleLowerCase()
				// urlWithBase = _basePath + url
				if (resource) {
					if (typeof resource === "string") {
						_routes[url] = fileRouter(resource, variables)
					}
					else {
						_routes[url] = resource;
					}
				}
				else {
					_routes[url] = fileRouter(url)
				}
				if (infoOn) console.log("router", _name, "route added:", url, ":", _routes[url])
			}
			else { // if (isRegex(url) pretty sure it can only be here if it is regex
				_regexRoutes[url] = resource
				if (infoOn) console.log("router", _name, "regex route added:", url, ":", _regexRoutes[url])
			}
		},
		router: async (request, response) => {
			// if (_middleware) {
			// 	for (const func of _middleware) {
			// 		func(request, response)
			// 	}
			// }
			var url = request.url.toLocaleLowerCase()
			var baseUrl = url.split('?')[0]
			var routeResolution = _routes[baseUrl]
			var firstMatchingRegexRoute = routeResolution ? false : matchesRegex(baseUrl)
			if (routeResolution) {
				routeResolution(request, response)
			}
			else if (firstMatchingRegexRoute) {
				firstMatchingRegexRoute(request, response)
			}
			else {
				await handler(request, response);
			}
		}
	}
}

module.exports = frameWork
