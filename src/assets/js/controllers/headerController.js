function headerController() {
//Reference to our loaded view
    var headerView;

    function initialize() {
        $.get("views/header.html")
            .done(setup)
            .fail(error);
    }

    //Called when the header.html has been loaded
    function setup(data) {
        //Loadthesidebar-contentintomemory
        headerView = $(data);

        // Check of de gebruiker is ingelogd en veranderd de header dan
        // als gebruiker admin is, laat zien de adminpagina
        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        } else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        } else {
            header.uitgelogd();
        }

        //Find all anchors and register the click-event
        headerView.find("a").on("click", handleClickMenuItem);

        //Empty the sidebar-div and add the resulting view to the page
        $(".header").empty().append(headerView);
    }

    function handleClickMenuItem() {
        //Get the data-controller from the clicked element(this)
        var controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

//Calledwhentheheader.htmlfailedtoload
    function error() {
        $(".content").html("Failed to load the header!");
    }

//Run the initialize function to kick things off
    initialize();

    // de header als er ingelogd is als normale gebruiker
    function setHeaderIngelogd() {
        var userid = session.get('gebruiker_id');
        var query = "SELECT MATCHED FROM gebruiker WHERE ID_GEBRUIKER = (?)";
        var matched = 0;
        databaseManager
            .query(query, userid)
            .done(function (data) {
                matched = data[0].MATCHED;
                $('#Uitlog').css("display", "initial");
                $('#LoginPage').css("display", "none");
                if (matched === 1) {
                    $('#Chat').css("display", "initial");
                } else {
                    $('#Chat').css("display", "none");
                }
                $('#Profiel').css("display", "initial");
                $('#AdminHomePage').css("display", "none");
                $('#Registreer').css("display", "none");
            })
            .fail(function (err) {
                console.log(err);
            });
    }

    // de header als er uitgelogd is/niet ingelogd is
    function setHeaderAlsUitgelogd() {
        $('#Uitlog').css("display", "none");
        $('#LoginPage').css("display", "initial");
        $('#Chat').css("display", "none");
        $('#Profiel').css("display", "none");
        $('#AdminHomePage').css("display", "none");
        $('#Registreer').css("display", "initial");
    }

    // de header als er ingelogd is als een admin
    function setHeaderAlsAdmin() {
        var userid = session.get('gebruiker_id');
        var query = "SELECT MATCHED FROM gebruiker WHERE ID_GEBRUIKER = (?)";
        var matched = 0;
        databaseManager
            .query(query, userid)
            .done(function (data) {
                matched = data[0].MATCHED;
                $('#Uitlog').css("display", "initial");
                $('#LoginPage').css("display", "none");
                if (matched === 1) {
                    $('#Chat').css("display", "initial");
                } else {
                    $('#Chat').css("display", "none");
                }
                $('#Profiel').css("display", "initial");
                $('#AdminHomePage').css("display", "initial");
                $('#Registreer').css("display", "none");
            })
            .fail(function (err) {
                console.log(err);
            });
    }

    // Dit zorgt ervoor dat de functies ook in andere controllers gebruikt kunnen worden
    return {
        ingelogd: setHeaderIngelogd,
        uitgelogd: setHeaderAlsUitgelogd,
        ingelogdAdmin: setHeaderAlsAdmin
    }
}
