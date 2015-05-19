function addFriend (username, profilename){
	var socket = io.connect("http://82.37.178.154:8765");
	socket.emit('addFriend', {
		'user' : username,
		'profile' : profilename
	});
};