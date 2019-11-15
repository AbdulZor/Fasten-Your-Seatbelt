$(function() {
    var height = $("#header").height() + 100;
    $("#login-button").click(function(){

        $("#login-box").show().animate({
            marginTop: height + 10
        }, 400 ).animate({
            marginTop: height
        }, 300)
    });
});
$(document).mouseup(function (e){

    var container = $("#login-box");

    if (!container.is(e.target) && !$("#login-button").is(e.target)  && container.has(e.target).length === 0) {
        container.animate({
            marginTop: "-250px"
        }, 500)
    }
});
$(function(){

    $("#register-button").click(function(){
       location.href="registreertest.html";
    });

});
$(function(){
    $('.login-box-button').on('click', function () {
        if ($(".login-input").val().length === 0) {
            alert('Vul uw gebruikersnaam en wachtwoord in voordat u probeert in te loggen');
            return false;
        }
    });
});