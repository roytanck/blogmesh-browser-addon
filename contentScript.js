BMabsolutePath = function(href) {
    var link = document.createElement("a");
    link.href = href;
    return link.href;
}

// create an object to fill with potential blogmesh and feed urls
var blogmesh_info = {};

// tags to look for in the page
var tags = [ 'blogmesh:name', 'blogmesh:feed_url', 'blogmesh:home_url' ];
var link_tags = [ 'application/rss+xml'/*, 'application/atom+xml'*/ ];

// loop through meta tags to look for Blogmesh info
tags.forEach( function( tagname ) {
	//var content = document.getElementsByName( tagname )[0].getAttribute('content');
	var tag_array = document.getElementsByName( tagname );
	var content = null;
	if( tag_array[0] ){
		content = tag_array[0].getAttribute('content');
	}
	if( content ){
		var key = tagname.substring( tagname.indexOf( ':' ) + 1 );
		blogmesh_info[ key ] = String( content );
	}
});

// make sure we have the site's name
if( !blogmesh_info.name ){
	blogmesh_info.name = document.getElementsByTagName("title")[0].innerHTML;
}

// look for generic RSS/ATOM link tags
link_tags.forEach( function( type ) {
	var feeds = document.querySelectorAll('link[type="' + type + '"]');
	if( feeds.length > 0 ){
		feeds.forEach( function( element ){
			var url = BMabsolutePath( element.getAttribute('href') );
			// no WordPress comments feeds...
			if( url.indexOf('/comments/') === -1 && !blogmesh_info[ type ] ){
				blogmesh_info[ type ] = url;
			}
		});
	}
});

// send a message with our findings
chrome.runtime.sendMessage( { message: 'content_blogmesh_info', blogmesh_info: blogmesh_info }, function(response) {
	console.log( response.farewell );
});	
