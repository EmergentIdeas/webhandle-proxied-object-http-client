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
initializeWebhandleComponent.staticFilePath = 'client-js'


initializeWebhandleComponent.setup = async function(webhandle, config) {
	let manager = new ComponentManager()
	manager.config = config
	
	webhandle.routers.preDynamic.use((req, res, next) => {
		if(config.alwaysProvideResources || !initializeWebhandleComponent.supportsMultipleImportMaps(req)) {
			manager.addExternalResources(res.locals.externalResourceManager)
		}
		next()
	})
	
	manager.addExternalResources = (externalResourceManager, options) => {
		externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: config.publicFilesPrefix + '/css/styles.css'
		})

		externalResourceManager.provideResource({
			url: config.publicFilesPrefix + '/index.mjs'
			, mimeType: 'application/javascript'
			, resourceType: 'module'
			, name: initializeWebhandleComponent.componentName
		})
	}


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
