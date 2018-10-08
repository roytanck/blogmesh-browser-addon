// enable page action for http and https sites
chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules( undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				//pageUrl: {hostEquals: 'roy.blogmesh.org'},
				pageUrl: { schemes: ['http','https'] },
			})
        ],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});


// create an array to store the blogmesh info from all tabs
var blogmesh_info = [];
// this var will hold the current active tab ID
var currentTab = null;

var httpRequest;

var blogmesh_feeds = null;


// listen for messages
chrome.runtime.onMessage.addListener(
	function( request, sender, sendResponse ){

		switch( request.message ){

			case 'content_blogmesh_info':
				if( request.blogmesh_info ){
					if( request.blogmesh_info ){
						console.log( 'Blogmesh info found.' );
					}
					// store the info for future reference
					blogmesh_info[ currentTab ] = request.blogmesh_info;
					sendResponse({farewell: "goodbye"});
				}			
				break;

			case 'return_blogmesh_info':
				console.log( 'popup is requesting info' );
				sendResponse( { blogmesh_info: blogmesh_info[ currentTab ] } );
				break;

			case 'blogmesh_subscribe':
				console.log( 'Subscribe button clicked' );
				blogmeshSubscribe( request.blogmesh_info );
				sendResponse( { farewell: 'Okay' } );
				break;

			case 'blogmesh_unsubscribe':
				console.log( 'Unsubscribe button clicked' );
				blogmeshUnsubscribe( request.blogmesh_info );
				sendResponse( { farewell: 'Okay' } );
				break;

			case 'blogmesh_check_subscribed':
				console.log( 'Checking if subscribed to: ' + request.feed_url );
				blogmeshGetFeeds( request.feed_url );
				sendResponse( { farewell: 'okay' } );
				break;

		}
	}
);


// listen for tab changes to update the ID
chrome.tabs.onActivated.addListener(function(activeInfo) {
	//console.log( 'Tab switch: ' + activeInfo.tabId );
	currentTab = parseInt( activeInfo.tabId );
});


var blogmeshSubscribe = function( info ){

	chrome.storage.sync.get({
		api_url: 'https://',
		api_key: ''
	}, function( options ){

		var dataStr = '';
		dataStr += 'name=' + encodeURIComponent( info.name );
		dataStr += '&feed_url=' + encodeURIComponent( info.feed_url );
		dataStr += '&home_url=' + encodeURIComponent( info.home_url );

		var hash_input = 'blogmesh_subscribe' + options.api_key + info.feed_url + info.name;

		dataStr += '&hash=' + sha512( hash_input );

		httpRequest = new XMLHttpRequest();

		httpRequest.onreadystatechange = function(){
			if( httpRequest.readyState === XMLHttpRequest.DONE ){
				if( httpRequest.status === 200 ){
					//alert( httpRequest.responseText );
					sendMessageToPopup( { subscribed: true } );
				} else {
					alert('There was a problem with the request.');
				}
			}
		}

		httpRequest.open( 'POST', options.api_url + 'subscribe' );
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send( dataStr );

	});

}


var blogmeshUnsubscribe = function( info ){

	chrome.storage.sync.get({
		api_url: 'https://',
		api_key: ''
	}, function( options ){

		var dataStr = '';
		dataStr += 'feed_url=' + encodeURIComponent( info.feed_url );
		
		var hash_input = 'blogmesh_unsubscribe' + options.api_key + info.feed_url;

		dataStr += '&hash=' + sha512( hash_input );

		httpRequest = new XMLHttpRequest();

		httpRequest.onreadystatechange = function(){
			if( httpRequest.readyState === XMLHttpRequest.DONE ){
				if( httpRequest.status === 200 ){
					//alert( httpRequest.responseText );
					sendMessageToPopup( { subscribed: false } );
				} else {
					alert('There was a problem with the request.');
				}
			}
		}

		httpRequest.open( 'POST', options.api_url + 'unsubscribe' );
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send( dataStr );
	});
}



var blogmeshGetFeeds = function( feed_url ){

	chrome.storage.sync.get({
		api_url: 'https://',
		api_key: ''
	}, function( options ){

		var hash_input = 'blogmesh_friends' + options.api_key;

		dataStr = 'hash=' + sha512( hash_input );

		httpRequest = new XMLHttpRequest();

		httpRequest.onreadystatechange = function(){
			if( httpRequest.readyState === XMLHttpRequest.DONE ){
				if( httpRequest.status === 200 ){
					// parse the RSS feed list returned by our own blogmesh site
					blogmesh_feeds = JSON.parse( httpRequest.responseText );
					// check if the feed_url is in the array
					if( blogmesh_feeds.indexOf( feed_url ) ){
						// subscribed, so return true
						sendMessageToPopup( { subscribed: true } );
					} else {
						// not currently subscribed, so return false
						sendMessageToPopup( { subscribed: false } );
					}
				} else {
					// log errors
					console.log( httpRequest.responseText );
					alert('There was a problem with the request.');
				}
			}
		}

		httpRequest.open( 'GET', options.api_url + 'friends?' + dataStr );
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send();

	});

}


var sendMessageToPopup = function( obj ){
	chrome.runtime.sendMessage( obj, function(response) {
		console.log(response.farewell);
	});
}