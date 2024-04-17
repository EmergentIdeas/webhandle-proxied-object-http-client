
import {assert} from 'chai'
import proxyService from "../client-lib/index.mjs";

export default function addTests() {
	describe("browser tests", function () {


		it("proxy all verbs", async function () {
			let service = proxyService({
				urlPrefix: '/service1/'
			})

			try {
				let data = await service.customerList(
					{
						firstName: 'Jim'
					}
					, {
						firstName: 'Bob'
					}
				)
				assert.equal(data[1].firstName, 'Bob')
			}
			catch (e) {
				console.log('caught in test. check that server is running.')
				throw (e)
			}

			let data = await service.getCustomerList({
					'first/Name&?=\'"': 'Bob&?=\'"'
				})
			assert.equal(data[0]['first/Name&?=\'"'], 'Bob&?=\'"')

			data = await service.reverse(
				{
					firstName: 'Jim'
				}
				, {
					'firstName&?=\'"': 'Bob&?=\'"'
				}
			)
			assert.equal(data[0]['firstName&?=\'"'], 'Bob&?=\'"')
			
			
			data = await service.deleteObj({id: 1234})
			assert.equal(data[0], 1234)
			
			data = await service.setObj(123, { firstName: 'Paul'})
			assert.equal(data.id, 123)
			assert.equal(data.firstName, 'Paul')

		})

		it("empty args", async function () {
			let service = proxyService({
				urlPrefix: '/service1/'
			})
			let data = await service.customerList()
			assert.isTrue(Array.isArray(data) && data.length == 0)
			data = await service.getCustomerList()
			assert.isTrue(Array.isArray(data) && data.length == 0)
		})

		it("service denied", async function () {
			let service = proxyService({
				urlPrefix: '/service2/'
			})

			try {
				let data = await service.customerList({ firstName: 'Jim' })
				throw new Error('request should have failed')
			}
			catch (e) {
				if(e.response.status == 401) {
					// great. This is what we expect
				}
				else {
					throw (e)
				}
			}
		})

		it("call denied", async function () {
			let service = proxyService({
				urlPrefix: '/service3/'
			})

			try {
				let data = await service.customerList({ firstName: 'Jim' })
				throw new Error('request should have failed')
			}
			catch (e) {
				if(e.response.status == 403) {
					// great. This is what we expect
				}
				else {
					throw (e)
				}
			}
		})
		
		

	})
}



