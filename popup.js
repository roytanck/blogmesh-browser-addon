
var port = chrome.runtime.connect();
var info = null;


// request the blogmesh info about this page
chrome.runtime.sendMessage( { message: 'return_blogmesh_info' }, function(response) {
	info = response.blogmesh_info;
	console.log( response.blogmesh_info );
	updateInfo( response.blogmesh_info );
});

function updateInfo( info ){

	if( !info ){
		$('#message').html('Sorry, this is not a Blogmesh site.');
		return;
	}

	if( info.name ){
		$('#name').show().html( info.name );
	}

	if( info.feed_url ){
		$('#follow').removeAttr('disabled'); //.disabled = false;
		$('#message').html('This is a Blogmesh site!');
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