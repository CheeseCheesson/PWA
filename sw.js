const staticCacheNmae = 's-app-v1';
const dynamicCacheNmae = 'd-app-v1';
// список статических файлов

const assetUrls = [
	'index.html',
	'js/app.js',
	'css/styles.css',
	'offline.html'
]

self.addEventListener('install', async event => {

	const cache = await caches.open(staticCacheNmae)
	await cache.addAll(assetUrls)
	
	// event.waitUntil(
		//кеширование 
		// caches.open(staticCacheNmae).then(cache => cache.addAll(assetUrls))
	// )
})

self.addEventListener('activate', async event => {
	const cacheNames = await caches.keys()
	await Promise.all(
		//чистим кэш от лишних данных
		cacheNames.filter(name => name !== staticCacheNmae).filter(name => name !== dynamicCacheNmae).map(name => caches.delete(name))
	)
})

self.addEventListener('fetch', event => {
	const { request } = event
	const url = new URL(request.url)
	if (url.origin === location.origin) {
		// получаем статику 
		// кеш first
		event.respondWith(cacheFirst(event.request))
	} else {
		// стратегия network First
		event.respondWith(networkFirst(request))
	}	
})

async function cacheFirst(request) {
	const cached = await caches.match(request)
	return cached ?? fetch(request)
}

async function networkFirst(request) {
	const cache = await caches.open(dynamicCacheNmae)
	try {
		const response = await fetch(request)
		cache.put(request, response.clone())
		return response
	} catch (error) {
		const cached = await cache.match(request)
		return cached ?? caches.match('/offline.html')
	}
}