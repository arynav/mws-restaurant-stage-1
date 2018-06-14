// register service worker

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').then(function(registration) {
    // Registration successful
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
}).catch(function(err) {
    // registration failed 
    	console.log('ServiceWorker registration failed: ', err);
    });
}