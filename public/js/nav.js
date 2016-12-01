$( document ).ready(function() {
    $(".checkbox").hide();
});

$("button").click(function(){
    $(".input").fadeOut();
    $(".checkbox").fadeIn();
});