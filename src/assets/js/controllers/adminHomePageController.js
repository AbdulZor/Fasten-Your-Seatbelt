function adminHomeController() {
    //Reference to our loaded view
    var adminHomeView;

    var AdminStatistieken;
    var aantalGebruikers = 0;
    var aantalBestemmingen = 0;
    var aantalInteresses = 0;
    var aantalMatches = 0;

    //hier word alles uitgevoerd
    function initialize() {
        $.get("views/AdminHomePage.html")
            .done(setup)
            .fail(error);
    }

    //Called when the AdminHomePage.html has been loaded
    function setup(data) {
    //Load the adminhome into memory
        adminHomeView = $(data);

        // Check of de gebruiker is ingelogd en veranderd de header dan
        // als gebruiker admin is, laat zien de adminpagina
        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        } else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        } else {
            header.uitgelogd();
        }

        // als er op interesse toevoegen geklikt wordt check naar input
        // voeg de interesse toe in database
        adminHomeView.find("#insert-query-interesse").on("click", function () {
            var interesseInput = $('#query-input').val();
            if (interesseInput != "" && interesseInput.length >= 1 && isNaN(interesseInput)) {
                insertQuery();
            } else
                alert("Ongeldige input - Interesse niet toegevoegd");
        });

        adminHomeView.find("#insert-button-bestemming").on("click", function () {
            var bestemmingInput = $('#query-input-bestemming').val();
            if (bestemmingInput != "" && bestemmingInput.length >= 1 && isNaN(bestemmingInput)) {
                insertQueryBestemming();
            } else {
                alert("Ongeldige input - Bestemming niet toegevoegd");
            }
        });

        adminHomeView.find("#insert-button-admin").on("click", function () {
            var adminInput = adminHomeView.find("#query-input-admin").val();
            if (adminInput != "" && adminInput != null) {
                insertQueryAdmin();
            } else {
                alert("Vul veld in bij admin toevoegen!");
            }
        });

        adminHomeView.find('#insert-button-verwijder').on("click", function () {
            removeUser();
            loadController(CONTROLLER_ADMIN_HOME);
        });

        // print de interesses, bestemmingen en statistieken op de pagina
        interessesPrinten();
        bestemmingenPrinten();
        loadStatistics();

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(adminHomeView);
    }

    // Voeg de nieuwe interesse toe in de database
    function insertQuery() {
        var interesse = $('#query-input').val();

        databaseManager
            .query("INSERT INTO interesses (INTERESSE) VALUES (?)", [interesse])
            .done(function () {
                alert("Interesse is in de database toegevoegd!");
                loadController(CONTROLLER_ADMIN_HOME);
            })
            .fail(function () {
                alert("Interesse is in de database toegevoegd!")
            });
    }

    // Verwijder de gebruiker uit de database
    function removeUser() {
        var user = $('#query-input-verwijder').val();
        var userid;

        databaseManager
            .query("SELECT ID_GEBRUIKER FROM gebruiker WHERE NAAM = (?)", [user])
            .done(function (data) {

                if (data == "") {
                    alert("Gebruiker is niet gevonden");
                } else {
                    userid = data[0].ID_GEBRUIKER;
                    databaseManager
                        .query("DELETE FROM gebruiker WHERE ID_GEBRUIKER = (?)", [userid]);
                    alert("Gebruiker is verwijderd");
                }
            })
    }

    // Maak een niet-admin gebruiker een admin
    function insertQueryAdmin() {
        var admin = $('#query-input-admin').val();

        databaseManager
            .query("SELECT ADMIN FROM gebruiker WHERE NAAM = (?)", [admin])
            .done(function (data) {
                if (data == "") {
                    alert("Gebruiker is niet gevonden");
                } else {
                    databaseManager
                        .query("UPDATE gebruiker SET ADMIN = '1' WHERE NAAM = (?)", [admin])
                        .done(function () {
                            alert("Gebruiker is nu admin");
                            loadController(CONTROLLER_ADMIN_HOME);
                        })
                        .fail(function () {
                            alert("Gebruiker is GEEN admin");
                        });
                }
            })
            .fail(function () {
                alert('Gebruiker is niet gevonden');
            });
    }

    // Voeg een nieuwe bestemming in de database
    function insertQueryBestemming() {
        var bestemming = $('#query-input-bestemming').val();

        databaseManager
            .query("INSERT INTO bestemmingen (BESTEMMING) VALUES(?)", [bestemming])
            .done(function () {
                alert("Bestemming is in de database toegevoegd!");
                loadController(CONTROLLER_ADMIN_HOME);
            })
            .fail(function (reason) {
                console.log(reason);
                alert("Bestemming is niet in de database toegevoegd!");
            });
    }

    // Print alle interesses op de pagina
    function interessesPrinten() {
        var query = "SELECT * FROM interesses";
        var adminData = Array();

        databaseManager
            .query(query)
            .done(function (data) {

                var ul = adminHomeView.find('.tags');
                for (var i = 0; i < data.length; i++) {
                    adminData[i] = data[i];
                }
                for (var i = 0; i < data.length; i++) {
                    var li = $("<li>")
                        .addClass("tag")
                        .html(adminData[i].INTERESSE)
                        .data('interesse_id', adminData[i].ID_INTERESSES)
                        .on("click", function () {
                            deleteTag($(this));
                            loadController(CONTROLLER_ADMIN_HOME);
                        });
                    ul.append(li);
                }
            })
            .fail(function (err) {
                console.log(err);
            });
    }


    // Print alle bestemmingen op de bestemmingen
    function bestemmingenPrinten() {
        var query = "SELECT BESTEMMING, ID_BESTEMMINGEN FROM bestemmingen";
        var adminData = Array();

        databaseManager
            .query(query)
            .done(function (data) {

                var ul = adminHomeView.find('.bestemmingen');

                for (var i = 0; i < data.length; i++) {
                    adminData[i] = data[i];
                }

                for (var i = 0; i < adminData.length; i++) {
                    var li = $("<li>")
                        .addClass("bestemming").html(adminData[i])
                        .html(adminData[i].BESTEMMING)
                        .data('bestemming_id', adminData[i].ID_BESTEMMINGEN)
                        .on("click", function () {
                            deleteBestemming($(this));
                            loadController(CONTROLLER_ADMIN_HOME);
                        });
                    ul.append(li);
                }
            })
            .fail(function (err) {
                console.log(err);
            });
    }

    // Verwijder de bestemming van het geselecteerde bestemming
    function deleteBestemming(element) {
        var bestemming_ID = element.data('bestemming_id');

        databaseManager
            .query("DELETE FROM fys_is105_4.bestemmingen WHERE ID_BESTEMMINGEN = (?)", [bestemming_ID]);

        element.remove();
    }

    // Verwijder de bestemming van het geselecteerde bestemming
    function deleteTag(element) {
        var interesse_ID = element.data('interesse_id');

        databaseManager
            .query("DELETE FROM fys_is105_4.interesses WHERE ID_INTERESSES = (?)", [interesse_ID]);

        element.remove();
    }

    // Laad statistieken van het aantal gebruikers, het aantal interesses die beschikbaar zijn
    // , het aantal bestemmingen en het aantal matches
    function loadStatistics() {
        var queryGebruikers = "SELECT COUNT(ID_GEBRUIKER) AS aantalGebruikers FROM gebruiker";
        var queryBestemmingen = "SELECT COUNT(ID_BESTEMMINGEN) AS aantalBestemmingen FROM bestemmingen";
        var queryInteresses = "SELECT COUNT(ID_INTERESSES) AS aantalInteresses FROM interesses";
        var queryMatches = "SELECT COUNT(ID_MATCH) AS aantalMatches FROM matches";

        databaseManager
            .query(queryGebruikers)
            .done(function (data) {
                aantalGebruikers = data[0].aantalGebruikers;
                adminHomeView.find('.aantalGebruikers').append(aantalGebruikers);
            })
            .fail(function (err) {
                console.log(err);
            });

        databaseManager
            .query(queryBestemmingen)
            .done(function (data) {
                aantalBestemmingen = data[0].aantalBestemmingen;
                adminHomeView.find('.aantalDestinations').append(aantalBestemmingen);
            })
            .fail(function (err) {
                console.log(err);
            });

        databaseManager
            .query(queryInteresses)
            .done(function (data) {
                aantalInteresses = data[0].aantalInteresses;
                adminHomeView.find('.aantalInterests').append(aantalInteresses);
            })
            .fail(function (err) {
                console.log(err);
            });

        databaseManager
            .query(queryMatches)
            .done(function (data) {
                aantalMatches = data[0].aantalMatches;
                adminHomeView.find('.aantalMatches').append(aantalMatches);
            })
            .fail(function (err) {
                console.log(err);
            });

        $(".content").empty().append(AdminStatistieken);
    }


//Called when the home.html failed to load
    function error() {
        $(".content").html("Failedtoloadcontent!");
    }

//Run the initialize function to kick things off
    initialize();
}
