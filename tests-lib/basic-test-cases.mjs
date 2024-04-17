
import {assert} from 'chai'
import proxyService from "../client-lib/index.mjs";

export default function addTests() {
	describe("basic tests", function () {

		it("create object", function () {
			let service = proxyService({
				localMembers: ['a']
			}
				, {
					a: 'b'
				})

			assert.equal(service.a, 'b')
		})

		it("set variable object", function () {
			let service = proxyService({
			}
				, {
					a: 'b'
					, d: 'e'
				})

			assert.equal(service.a, 'b')
			service.a = 'c'
			assert.equal(service.a, 'c')

			let error
			try {
				service.b = 'hello'
				error = new Error('should not have been able to set property')
			}
			catch (e) {
			}

			if (error) {
				throw error
			}


			assert.equal(service.d, 'e')
			service.d = 'f'
			assert.equal(service.d, 'f')
		})

		it("proxy unknown functions", async function () {
			let service = proxyService({
				urlPrefix: 'http://localhost:3000/service1/'
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

			try {
				let data = await service.getCustomerList({ firstName: 'Jim' })
				assert.equal(data[0].firstName, 'Jim')
			}
			catch (e) {
				console.log('caught in test. check that server is running.')
				throw (e)
			}
			try {
				let data = await service.reverse(
					{
						firstName: 'Jim'
					}
					, {
						firstName: 'Bob'
					}
				)
				assert.equal(data[0].firstName, 'Bob')
			}
			catch (e) {
				console.log('caught in test. check that server is running.')
				throw (e)
			}
		})

		it("proxy unknown functions on a different url", async function () {
			let service = proxyService({
				urlPrefix: 'http://servicetest:3000/service1/'
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

			try {
				let data = await service.getCustomerList({ firstName: 'Jim' })
				assert.equal(data[0].firstName, 'Jim')
			}
			catch (e) {
				console.log('caught in test. check that server is running.')
				throw (e)
			}

		})
	})
}