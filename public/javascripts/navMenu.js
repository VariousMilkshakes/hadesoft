$(document).ready(function (){

	$("nav").on("click", function (){
		toggleConsole();
	});

});

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
	var shiftBox = $(".shiftBox");

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

	var targetElement = "footer ul";

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

				$(targetElement + ":last-child span").before(currentLetter);
				currentX++;

			}

			if (currentX == 0) {

				var newRowHTML = "<li class='nav'><span class='blink'>_</span></li>"

				$("li .blink").remove();
				$(targetElement).append(newRowHTML);
			}

		} else {
			window.clearInterval(typeSpeed);

			$("footer ul").on("click", ".nav", function (event){
				closeConsole(event);
			});
		}
	}, 40);
}

function closeConsole (e){

	$("footer ul").off("click", ".nav");

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
	$("footer ul").append("<li class='nav'><span class='blink'>_</span></li>");

	var showContentCss = { "height" : "3000px" };
	var shiftBox = $(".shiftBox");

	shiftBox.animate(showContentCss, 1000, "linear", function (){

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

	$('html, body').animate({ scrollTop : offset }, offset);
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