$(document).ready(function (){
	updateBindings();

	$("#f-new-post").on("click", function (){
		if (panelOpen){
			showForum("stack");
		}else{
			showForum("creator");
		}
	});
});

function updateBindings(){
	$(".openMenu").on("click", function (){
		toggleConsole();
	});

	$(".online-users>div").on("click", function (e){
		toggleName(e);
	});

	$(".post-header").on("click", function (e){
		var parent = $(e.target).parent().attr('id');
		console.log(parent);
		socket.emit("getPost", parent);
	});
}

var menuOpen = false;

function toggleConsole (){
	if (menuOpen) {
		collapseConsole();
	} else {
		expandConsole();
	}
}

function expandConsole (){

	window.scrollTo(0, 0);

	var hideContentCss = { "height" : "0px" };
	var shiftBox = $(".container");

	shiftBox.css("overflow", "hidden");
	shiftBox.animate(hideContentCss, 1000, "linear", function (){
		menuOpen = true;
		setTimeout(function (){ typeOut() }, 350);
	});

};

var menuContent = {
	0 : { "name" : "Home*", "target" : ".titleArea" },
	1 : { "name" : "Projects*", "target" : "#projectBox h4" },
	2 : { "name" : "Our Team*", "target" : ".teamArea" },
	3 : { "name" : "Forum*", "target" : ".forumArea" }
};

function typeOut (){

	var targetElement = "footer .left";

	// Each navigation title ends with * signal move onto next line

	var menuOptions = sizeOf(menuContent);
	var currentOption = 0;
	var currentX = 0;

	var typeSpeed = window.setInterval( function (){
		var count = currentOption;

		if (count < menuOptions) {

			var currentID = menuContent[count]["target"];

			var currentContent = menuContent[count]["name"].split('');
			var currentLetter = currentContent[currentX];

			if (currentLetter == '*') {

				currentX = 0;
				currentOption ++;

			} else {

				$(targetElement).children().last().children("span").before(currentLetter);
				currentX++;

			}

			if (currentX == 0) {

				var newRowHTML = "<li class='nav'><span class='blink'>_</span></li>";

				$("li .blink").remove();
				$(targetElement).append(newRowHTML);
			}

		} else {
			window.clearInterval(typeSpeed);

			$("footer .left").on("click", ".nav", function (event){
				closeConsole(event);
			});
		}
	}, 40);
}

function closeConsole (e){

	$("footer .left").off("click", ".nav");

	var spinner = $("li .blink");
	spinner.removeClass("blink");
	spinner.html("<i class='fa fa-arrows-h fa-pulse'></i>");

	var chosenOption = $(e.target).text();

	if (chosenOption == "") {
		collapseConsole();
	} else {
		chosenOption = chosenOption + '*';

		$.each(menuContent, function(i, v){

			if (v["name"] == chosenOption) {
				var target = v["target"];

				collapseConsole(target);
			}

		});

	}

}

function collapseConsole (location){

	$(".nav").remove();
	$("footer .left").append("<li class='nav'><span class='blink'>_</span></li>");

	var showContentCss = { "height" : "3000px" };
	var shiftBox = $(".container");

	shiftBox.animate(showContentCss, 500, "linear", function (){

		shiftBox.removeAttr("style");
		menuOpen = false;

		if (location != null) {
			steadyScrollTo(location);
		}

	});
}

function steadyScrollTo (id){
	var offset = $(id).offset().top /*+ $(window).height()*/ - 130;
	console.log(offset + " , " + $(window).height() + " , " + $(id).offset().top);

	$('html, body').animate({ scrollTop : offset }, offset / 3);
}


function toggleName (e){
	var user = $(e.currentTarget);
	var header = user.children('a');

	if (header.css('display') == 'none') {
		header.css('display', 'inline');
	} else {
		header.css('display', 'none');
	}
}

var lostFolk = [];

// Add and Remove active users from tacker
function controlTracker (users, user){
	var holder = $(".online-users");
	var html = "<div id='currentUser'><img src='./images/standing.png' alt='a'><a href='/user/" + user + "/profile/'>a</a></div>";

	for(each in users) {
		var contact = users[each].value;
		html = html + "<div><img src='" + contact.avatar + "' alt='" + contact.name + "'></img>" + "<a href='/user/" + contact.name + "/profile'>" + contact.name + "</a></div>";
	}

	holder.html(html);
	updateBindings();
}


function sizeOf (obj){

    var size = 0;

    for (key in obj) {

        //Ignores empty keys
        if (obj.hasOwnProperty(key)) {

            size += 1;
        }
    }

    return size;
}
