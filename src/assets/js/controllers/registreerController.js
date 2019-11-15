function registreerController() {
    //Reference to our loaded view
    var registreerView;

    function initialize() {
        $.get("views/Registreer.html")
            .done(setup)
            .fail(error);
    }

    //Called when the registreertest.html has been loaded
    function setup(data) {
        //Load the welcome-content into memory
        registreerView = $(data);

        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        }
        else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        }
        else {
            header.uitgelogd();
        }

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(registreerView);
    }

    //Called when the Registreer.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}