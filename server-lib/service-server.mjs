

/**
 * Takes an object and adds to a router so that you can call its methods over http request
 */
export default class ServiceServer {
	/**
	 * 
	 * @param {object} service The service to proxy
	 * @param {object} [options] 
	 * @param {boolean} [options.allowCrossDomainRequests] Set to true to allow cross domain requests 
	 * @param {function} [options.isAuthorizedToService] Determine if the caller is allowed to interact in any way with the service. This is done
	 * before the arguments are parsed
	 * @param {function} [options.isAuthorizedToService] Determine if the the caller is allowed to make this call based on these arguments.
	 * @param {function} [options.addOperationCorsHeaders] Add CORS headers for the option call
	 * @param {function} [options.addOptionCorsHeaders] Add CORS headers for the data calls 
	 */
	constructor(service, options) {
		Object.assign(this, options)
		this.service = service
	}
	
	async isAuthorizedToService(req) {
		return true
	}

	async isAuthorizedToCall(req, methodName, serviceMethod, args) {
		return true
	}

	addOptionCorsHeaders(req, res) {
		res.set('Access-Control-Allow-Origin', '*')
		res.set('Access-Control-Allow-Headers', '*')
	}

	addOperationCorsHeaders(req, res) {
		res.set('Access-Control-Allow-Origin', '*')
	}

	handleOptions(req, res, next) {
		if (this.allowCrossDomainRequests) {
			this.addOptionCorsHeaders(req, res)
		}
		res.end()
	}
	
	determineArgs(req) {
		let args
		if (req.method === 'GET') {
			if(Object.keys(req.query).length == 0) {
				// this is fine, we just have no query parameters, so no object from the requesting client	
			}
			else {
				args = [Object.assign({}, req.query)]
			}
		}
		else {
			args = req.body
		}
		return args
	}

	determineServiceMethod(req) {
		let methodName = req.params.methodName
		let method = this.service[methodName]
		return [method, methodName]
	}

	async handleRequest(req, res, next) {
		// Check to see if we should be talking with them at all.
		if((await this.isAuthorizedToService(req)) == false) {
			res.statusCode = 401
			res.end()
			return	
		}

		let args = this.determineArgs(req)
		let [serviceMethod, methodName] = this.determineServiceMethod(req)

		if (serviceMethod && typeof serviceMethod === 'function') {
			// Check to see if they're authorized to access this endpoint with these arguments
			if((await this.isAuthorizedToCall(req, methodName, serviceMethod, args)) == false) {
				res.statusCode = 403
				res.end()
				return	
			}

			if (this.allowCrossDomainRequests) {
				this.addOperationCorsHeaders(req, res)
			}

			try {
				let result = serviceMethod.apply(this.service, args)
				if (result instanceof Promise) {
					result = await result
				}
				res.json(result)
				return
			}
			catch (e) {
				res.statusCode = 500
				res.end()
				return
			}
		}
		else {
			res.statusCode = 404
			res.end()
			return
		}
	}

	addToRouter(router) {
		router.options(/.*/, this.handleOptions.bind(this))
		router.use('/:methodName', this.handleRequest.bind(this))
	}
}
