# @webhandle/proxied-object-http-client

A dead simple way to expose a javascript object to requests in RPC (Remote Procedure Call) style over http. 

## Install

```bash
npm install @webhandle/proxied-object-http-client
```

## Dependencies

This package doesn't require Express, but the addToRouter method expects that you pass it an express
router or something similar.

## Usage

### Server side

```js

import ServiceServer from "@webhandle/proxied-object-http-client"

let service = {
	getCustomerList(query) {
	}
	, customerList(...multipleParameters) {
	}
	, reverse(one, two) {
		return [two, one]
	}
	, deleteObj(one) {
	}
	, setObj(id, obj) {
	}
}

let server = new ServiceServer(service, {
})

let router = express.Router()
server.addToRouter(router)
app.use('/service1', router)
```

### Client side

```js
import proxyService from "@webhandle/proxied-object-http-client"

let service = proxyService({
	urlPrefix: '/service1/'
})

data = await service.setObj(123, { firstName: 'Paul'})
```

### Concepts

The client side of this code just creates a JS proxy which makes an http call
based on the method name used. This can be any method name. It doesn't know if
that method actually exists on the server or the object being proxied.

The server side processes request, matching the request to the method hame.

This is RESTish. Calls that start with `get` are GET requests, `delete` DELETE requests,
and `set` PUT requests. This is more for caching purposes than adherence to RESTful 
ideology. For example, if you call a `delete` function it passes the parameters as part
of the body instead of appending an id to the url.

GET functions are just a bit different. They take only zero or one arguments and have
any members of the first argument sent as query parameters. This is necessary because
HTTP doesn't allow a body with a GET request. 


## Options 

Server side options look like this:

```js
	/**
	 * @param {object} service The service to proxy
	 * @param {object} [options] 
	 * @param {boolean} [options.allowCrossDomainRequests] Set to true to allow cross domain requests 
	 * @param {function} [options.isAuthorizedToService] Determine if the caller is allowed to interact in any way with the service. This is done
	 * before the arguments are parsed
	 * @param {function} [options.isAuthorizedToCall] Determine if the the caller is allowed to make this call based on these arguments.
	 * @param {function} [options.addOperationCorsHeaders] Add CORS headers for the option call
	 * @param {function} [options.addOptionCorsHeaders] Add CORS headers for the data calls 
	 */
```

Allowing cross domain requests just sets the CORS attributes to be as permissive as possible.
That is probably not a good idea in production unless the `addOperationCorsHeaders` and
`addOptionCorsHeaders` are overridden with code specific to your application.

Client side options have more to do with how to make the individual requests:

```js
/**
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
```

As you can see from the example code, you don't have to base the clients service proxy on
any real object at all. However, if you want to add this sort of proxy functionality to
an existing object you can do so by passing it as the second parameter.

If you do pass a `baseObject` but do NOT specify `localMembers`, the code will look at the
existing properties for the `baseObject` and refuse to proxy those.




