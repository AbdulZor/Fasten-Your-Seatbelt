$(function(){
    $('#menu-button').click(function(){
        $('#menu-screen').show().animate({
            marginRight: 0
        }, 200)
    });

    $(document).mouseup(function (e){

        var container = $('#menu-screen');
        var button = $('#menu-button');

        if (!container.is(e.target) && !container.is(button.target)){
            container.animate({
                marginRight: -300
            }, 200)
        }

    });


});