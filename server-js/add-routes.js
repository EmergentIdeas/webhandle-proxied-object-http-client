
import path from "path"
import express from "express"
import filog from "filter-log"
import loadTemplates from "./add-templates.js"
import webhandle from "webhandle"
import ServiceServer from "../server-lib/service-server.mjs"

let log

export default function (app) {
	log = filog('unknown')

	// add a couple javascript based tripartite templates. More a placeholder
	// for project specific templates than it is a useful library.
	loadTemplates()

	webhandle.routers.preStatic.get(/.*\.cjs$/, (req, res, next) => {
		console.log('cjs')
		res.set('Content-Type', "application/javascript")
		next()
	})



	let service = {
		getCustomerList(customer) {
			if(customer) {
				return [customer]
			}
			return []
		}
		, customerList(...customers) {
			return customers
		}
		, reverse(one, two) {
			return [two, one]
		}
		, deleteObj(one) {
			return [one.id]
		}
		, setObj(id, obj) {
			obj.id = id
			return obj
		}
	}

	let server = new ServiceServer(service, {
		allowCrossDomainRequests: true
	})

	let router = express.Router()
	server.addToRouter(router)
	app.use('/service1', router)

	router = express.Router()
	server = new ServiceServer(service, {
		async isAuthorizedToService(req) {
			return false
		} 
	})
	server.addToRouter(router)
	app.use('/service2', router)

	router = express.Router()
	server = new ServiceServer(service, {
		async isAuthorizedToCall(req) {
			return false
		} 
	})
	server.addToRouter(router)
	app.use('/service3', router)

}

