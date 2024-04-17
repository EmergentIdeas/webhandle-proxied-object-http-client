
import mocha from 'mocha'
mocha.setup('bdd')
mocha.run()
import addTests from "../tests-lib/basic-test-cases.mjs"
import addBrowserTests from "../tests-lib/browser-test-cases.mjs"

addTests()
addBrowserTests()



