var panelOpen = false;

function forumPosts (filter){
    console.log('Getting Forum Posts');
    socket.emit('requestPosts', filter);
}

function showForum (target){
	var box = "#post-creator";
    var postStack = "#post-holder";
    var preview = "#post-viewer";
	var editor = $(box);
    var stack = $(postStack);
    var viewer = $(preview);

    switch (target) {
        case "creator":
            editor.css("display", "block");
            stack.css("display", "none");
            viewer.css("display", "none");
            $("#f-new-post").text('<')
            panelOpen = true;
            break;
        case "preview":
            editor.css("display", "none");
            stack.css("display", "none");
            viewer.css("display", "block");
            $("#f-new-post").text('<')
            panelOpen = true;
            break;
        case "stack":
        default:
            editor.css("display", "none");
            stack.css("display", "block");
            viewer.css("display", "none");
            $("#f-new-post").text('+')
            panelOpen = false;
            break;
    }
}

function displayPosts (postArr){
    for(each in postArr){
        var postObj = postArr[each].value;
        var postHTML = "<div class='post' id='" + postObj.key + "'><h6 class='post-header'>" + postObj.title + "</h6><h8>" + postObj.editor + " - " + postObj.time + "</h8></div>";
        var forumBox = $("#post-holder").append(postHTML);
    }

    updateBindings();
}

function viewPost (postObj){
    var title = postObj.title;
    var editor = postObj.editor;
    var content = postObj.post;
    var postBox = $("#post-viewer");

    if (postObj.type == "html") {
        postBox.text(content);
    } else if (postObj.type == "text") {
        postBox.text(content);
    }

    showForum("preview");
}
