import createInitializeWebhandleComponent from "@webhandle/initialize-webhandle-component/create-initialize-webhandle-component.mjs"
import ComponentManager from "@webhandle/initialize-webhandle-component/component-manager.mjs"
import path from "node:path"

const initializeWebhandleComponent = createInitializeWebhandleComponent()

initializeWebhandleComponent.componentName = '@webhandle/proxied-object-http-client'
initializeWebhandleComponent.componentDir = import.meta.dirname
initializeWebhandleComponent.defaultConfig = {
	"publicFilesPrefix": '/' + initializeWebhandleComponent.componentName + "/files"
	, "alwaysProvideResources": false
}
initializeWebhandleComponent.staticFilePath = 'client-lib'


initializeWebhandleComponent.setup = async function(webhandle, config) {
	let manager = new ComponentManager()
	manager.config = config
	
	if(config.alwaysProvideResources) {
		webhandle.routers.preDynamic.use((req, res, next) => {
			manager.addExternalResources(res.locals.externalResourceManager)
			next()
		})
	}
	
	manager.addExternalResources = (externalResourceManager, options) => {
		externalResourceManager.provideResource({
			url: config.publicFilesPrefix + '/index.mjs'
			, mimeType: 'application/javascript'
			, resourceType: 'module'
			, name: initializeWebhandleComponent.componentName
		})
	}

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/addExternalResources', (data) => {
		let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
	})

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/renderExternalResources', (data) => {
		let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
		return externalResourceManager.render()
	})

	// Allow access to the component and style code
	let filePath = path.join(initializeWebhandleComponent.componentDir, initializeWebhandleComponent.staticFilePath)
	manager.staticPaths.push(
		webhandle.addStaticDir(
			filePath,
			{
				urlPrefix: config.publicFilesPrefix
				, fixedSetOfFiles: true
			}
		)
	)
	
	return manager
}

export default initializeWebhandleComponent
