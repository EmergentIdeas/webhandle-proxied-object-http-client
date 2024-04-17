function isFirstCharLowerCase(str) {
	return !!((str[0] + '').match(/[a-z]/))
}

export class ServiceWrapperProxy {

	constructor(options) {
		Object.assign(this, {
			knownGet: []
			, knownPost: []
			, knownDelete: []
			, localMembers: []
		}, options)
	}
	isFirstCharLowerCase(str) {
		return !!((str[0] + '').match(/[a-z]/))
	}

	determineVerb(prop) {
		if (this.knownGet.includes(prop)) {
			return "GET"
		}
		if (this.knownDelete.includes(prop)) {
			return "DELETE"
		}
		if (this.knownPost.includes(prop)) {
			return "POST"
		}

		if (prop.startsWith('get')) {
			let sub = prop.substring(3)
			// Only make this a get request if the next char is not lower case
			if(!this.isFirstCharLowerCase(sub)) {
				return "GET"
			}
		}
		if (prop.startsWith('set')) {
			let sub = prop.substring(3)
			// Only make this a put request if the next char is not lower case
			if(!this.isFirstCharLowerCase(sub)) {
				return "PUT"
			}
		}
		if (prop.startsWith('delete')) {
			let sub = prop.substring(6)
			// Only make this a delete request if the next char is not lower case
			if(!this.isFirstCharLowerCase(sub)) {
				return "DELETE"
			}
		}

		return "POST"
	}

	determineUrl(prop) {
		let url = this.urlPrefix + prop
		return url
	}

	get(target, prop, receiver) {
		if (this.localMembers.includes(prop)) {
			return Reflect.get(...arguments);
		}

		let verb = this.determineVerb(prop)
		let url = this.determineUrl(prop, verb)
		
		
		
		
		let headers = Object.assign({
			"Content-Type": "application/json"
		}, this.headers)

		return async function (...args) {

			let body
			if(verb === 'GET') {
				if(args.length > 0) {
					// If this is a get query, we can't just send a post body, we have to break it into 
					// parameters. However, parameters are named and arguments are not... so let's assume
					// we have one object as the first argument and get the property names from that.
					let first = args[0]
					if(typeof first === 'object') {
						let parts = []
						for(let key of Object.keys(first)) {
							parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(first[key]))
						}
						url += "?" + parts.join('&')

					}
				}
			}
			else {
				body = JSON.stringify(args)
			}
			// console.log(`${url} (${verb}) ${JSON.stringify(body)}`)
			
			let options = {
				method: verb
				, headers: headers
			}
			if(body) {
				options.body = JSON.stringify(args)
			}
				
			let response = await fetch(url, options)
			if(response.status != 200) {
				let error = new Error('Could not make request')
				error.response = response
				throw error
			}
			let data = await response.json()
			return data
		}
	}


	set(target, prop, val) { 
		if (this.localMembers.includes(prop)) {
			target[prop] = val;
			return true;
		} else {
			throw new Error("Access denied");
		}
	}
}

/**
 * 
 * @param {object} options 
 * @param {string} options.urlPrefix The prefixed use form making calls. It can be relative or absolute
 * but should probably end in a /
 * @param {array} [options.knownGet] Methods we have to use GET for
 * @param {array} [options.knownPost] Methods we have to use POST for
 * @param {array} [options.knowDelete] Methods we have to use DELETE for
 * @param {array} [options.localMembers] Members we should not attempt to make proxy calls for
 * @param {object} [options.headers] A map which should be included as headers on any call
 * @param {object} [baseObject] If included, the object that will be proxied
 */
export default function proxyService(options = {}, baseObject = {}) {
	
	if(!options.localMembers) {
		options.localMembers = []
		options.localMembers.push(...Object.getOwnPropertyNames(baseObject))
	}

	let proxy = new Proxy(baseObject, new ServiceWrapperProxy(options));
	return proxy


}