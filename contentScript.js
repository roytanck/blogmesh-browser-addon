console.log( 'content script run' );



// create an object to fill with potential blogmesh and feed urls
var blogmesh_info = {};

// tags to look for in the page
var tags = [ 'blogmesh:name', 'blogmesh:feed_url', 'blogmesh:home_url' ];
var link_tags = [ 'application/rss+xml', 'application/atom+xml' ];

// loop through meta tags to look for Blogmesh info
tags.forEach( function( tagname ) {
	var content = document.getElementsByName( tagname )[0].getAttribute('content');
	if( content ){
		var key = tagname.substring( tagname.indexOf( ':' ) + 1 );
		blogmesh_info[ key ] = String( content );
	}
});

// look for generic RSS/ATOM link tags
link_tags.forEach( function( type ) {
	var feeds = document.querySelectorAll('link[type="' + type + '"]')
	if( feeds.length > 0 ){
		feeds.forEach( function( element ){
			blogmesh_info[ type ] = element.getAttribute('href');
		});
	}
});

// send a message with our findings
chrome.runtime.sendMessage( { message: 'content_blogmesh_info', blogmesh_info: blogmesh_info }, function(response) {
	console.log( response.farewell );
});	
