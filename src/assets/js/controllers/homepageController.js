function homepageController() {
    //Reference to our loaded view
    var homepageView;
    var bestemming_Naam;
    var vandaag2;
    var startDate_ID;
    var endDate_ID;

    function initialize() {
        $.get("views/Homepage.html")
            .done(setup)
            .fail(error);
    }

    //Deze functie pakt de dag vandaag, door deze functie kan je niet later dan huidige dag kan aankomen
    function setMinBeginDateVertek() {
        var dateAankomst = homepageView.find("#date-start").val();

        //vandaag2 = yyyy + '-' + mm + '-' + dd;
        //document.getElementById("date-start").setAttribute("min", vandaag2);
    }

    //Deze functie pakt de dag vandaag, door deze functie kan je niet later dan huidige dag kan aankomen
    function setMinBeginDateAankomst() {
        var vandaag = new Date();
        var dd = vandaag.getDate();
        var mm = vandaag.getMonth() + 1; //januari is 0
        var yyyy = vandaag.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }

        vandaag = yyyy + '-' + mm + '-' + dd;
        document.getElementById("date-start").setAttribute("min", vandaag);
    }

    //Called when the Homepage.html has been loaded
    function setup(data) {
        //Load the welcome-content into memory
        homepageView = $(data);

        // Check of de gebruiker is ingelogd en veranderd de header dan
        // als gebruiker admin is, laat zien de adminpagina
        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        } else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        } else {
            header.uitgelogd();
        }

        homepageView.find("a").on("click", handleClickMenuItem);

        updateList();

        var dateAankomst = homepageView.find("#date-start").val();
        if (dateAankomst != "") {
            $('#date-end').prop('disabled', false);
        }

        homepageView.find('#date-start').change(function () {
            if ($(this).val() != "") {
                $('#date-end').prop('disabled', false);
                document.getElementById("date-end").setAttribute("min", dateAankomst);
            } else {
                $('#date-end').prop('disabled', true);
            }
        });

        homepageView.find('#date-end').on('mouseenter', function () {
            dateAankomst = homepageView.find("#date-start").val();
            if (dateAankomst == "") {
                $('#date-end').prop('disabled', true);
            } else {
                $('#date-end').prop('disabled', false);
                document.getElementById("date-end").setAttribute("min", dateAankomst);
            }

        });


        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(homepageView);

        //Deze pop-up wordt getoond wanneer een gebruiker ingelogt is en op matchen klikt
        function alertpopupIngelogd() {
            insertDestination();
            //loadController(CONTROLLER_PROFIEL);
        }

        //Deze pop-up wordt getoond wanneer een gebruiker niet ingelogt is en op matchen klikt
        function alertpopupUitgelogd() {
            alert("U moet eerst registreren om te kunnen matchen!");
            loadController(CONTROLLER_REGISTREER);
        }

        setMinBeginDateAankomst();

        //if user is logged in link to profile page else link to register page
        homepageView.find(".match-button").on("click", function () {
            isLoggedIn(alertpopupIngelogd, alertpopupUitgelogd);
        });
    }

    function handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        var controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    //Called when the Homepage.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Deze functie print alle bestemmingen uit de tabel bestemmingen
    function updateList() {
        //Vraagt alle bestemmingen op in alfabetische volgorde
        var query = "SELECT * FROM fys_is105_4.bestemmingen ORDER BY BESTEMMING";
        var bestemmingen = Array();

        var select = homepageView.find("#bestemming-select");

        databaseManager
            .query(query)
            .done(function (data) {
                for (var i = 0; i < data.length; i++) {
                    bestemmingen[i] = data[i].BESTEMMING;
                }

                for (var i = 0; i < bestemmingen.length; i++) {
                    var option = document.createElement("OPTION");
                    option.innerText = bestemmingen[i];
                    select.append(option);
                }
            });
    }

    //Deze functie insert de bestemming in de tabel gebruiker_bestemmingen
    function insertDestination() {
        bestemming_Naam = homepageView.find("#bestemming-select")[0].value;
        startDate_ID = homepageView.find("#date-start")[0].value;
        endDate_ID = homepageView.find("#date-end")[0].value;
        var bestemming_ID;
        var gebruiker_ID = [session.get('gebruiker_id')];
        bestemming_Naam = String(bestemming_Naam);
        if ((bestemming_Naam != "Kies een bestemming" || bestemming_Naam != "") && startDate_ID != "" && endDate_ID != "") {

            databaseManager
                .query("SELECT ID_BESTEMMINGEN FROM bestemmingen WHERE BESTEMMING = (?)", [bestemming_Naam])
                .done(function (data) {
                    bestemming_ID = data[0].ID_BESTEMMINGEN;
                    gebruiker_ID = parseInt(gebruiker_ID);

                    var gebruikerReis = [gebruiker_ID, bestemming_ID, startDate_ID, endDate_ID];
                    databaseManager
                        .query("INSERT INTO gebruiker_bestemmingen (ID_GEBRUIKER, ID_BESTEMMING, AANKOMST_DATUM, VERTREK_DATUM)  VALUES (?)", [gebruikerReis]);
                    alert("Gelukt! wij gaan zo snel mogelijk een match voor u regelen!");
                    loadController(CONTROLLER_PROFIEL);
                });
        }else {
            alert("Vul alle velden in!");
        }
    }

//Run the initialize function to kick things off
    initialize();

}