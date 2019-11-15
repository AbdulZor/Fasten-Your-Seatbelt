function faqController() {
    //Reference to our loaded view
    var faqView;

    function initialize() {
        $.get("views/Faq.html")
            .done(setup)
            .fail(error);
    }

    //Called when the faq.html has been loaded
    function setup(data) {
        //Load the welcome-content into memory
        faqView = $(data);

        // Check of de gebruiker is ingelogd en veranderd de header dan
        // als gebruiker admin is, laat zien de adminpagina
        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        }
        else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        }
        else {
            header.uitgelogd();
        }

        faqView.find(".contact").on("click", function() {
           loadController(contactController());
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(faqView);

        faqView.find("a").on("click",handleClickMenuItem);
    }

    function handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        var controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }


    //Called when the faq.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}