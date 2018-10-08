
var port = chrome.runtime.connect();
var info = null;


// request the blogmesh info about this page
chrome.runtime.sendMessage( { message: 'return_blogmesh_info' }, function(response) {
	info = response.blogmesh_info;
	if( info != undefined ){
		console.log( response.blogmesh_info );
		updateInfo( response.blogmesh_info );
	} else {
		$('#message').html('Please reload this tab to refresh Blogmesh information.');
		return;
	}
});

function updateInfo( info ){
console.log(info);
	if( !info ){
		$('#message').html('Sorry, this is not a Blogmesh site.');
		return;
	}

	// check if a blogmesh feed url is available
	if( info.feed_url ){
		$('#follow').removeAttr('disabled');
		$('#message').html('This is a Blogmesh site!');
	} else if( info['application/rss+xml'] ){
		// an RSS fee was found, so enable the button
		$('#follow').removeAttr('disabled');
		$('#message').html('This site offers an RSS feed!');
		// overwrite the empty blogmesh feed url with the RSS one
		info.feed_url = info['application/rss+xml'];
	}

	// check if we're currently subscribed to this feed
	if( info.feed_url ){
		chrome.runtime.sendMessage( { message: 'blogmesh_check_subscribed', feed_url: info.feed_url }, function(response) {
			console.log( response.farewell );
		});
	}

}

//document.getElementById("follow").addEventListener("click", function(){
$('#follow').click( function(e){
	chrome.runtime.sendMessage( { message: 'blogmesh_subscribe', blogmesh_info: info }, function( response ) {
		console.log( response.farewell );
	});
});


$('#unfollow').click( function(e){
	chrome.runtime.sendMessage( { message: 'blogmesh_unsubscribe', blogmesh_info: info }, function( response ) {
		console.log( response.farewell );
	});
});


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		//console.log(request);
		if( request.subscribed == true ){
			$('#follow').hide();
			$('#unfollow').show();
		}
		if( request.subscribed == false ){
			$('#follow').show();
			$('#unfollow').hide();
		}
		sendResponse({farewell: "goodbye"});
});