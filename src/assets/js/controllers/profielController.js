function profielController() {
    //Reference to our loaded view
    var profielView;
    var profile;

    function initialize() {
        //Get data 'gebruiker' table
        var query = "SELECT NAAM, EMAIL, GESLACHT, TIMESTAMPDIFF(YEAR ,GEBOORTEDATUM, CURRENT_DATE) AS GEBOORTEDATUM, TELEFOONNUMMER FROM gebruiker WHERE NAAM = (?)";

        //Use database manager to execute query
        databaseManager
            .query(query, [session.get('username')])
            .done(function (data) {
                profile = data[0];
                //If user is not found link to home page
                if (!profile) {
                    loadController(CONTROLLER_HOMEPAGE);
                    return;
                }
                $.get("views/Profiel.html")
                    .done(setup)
                    .fail(error);
            })
            .fail(function (err) {
                console.log(err);
            });
    }

    //Called when the Profiel.html has been loaded
    function setup(data) {

        // Check of de gebruiker is ingelogd en veranderd de header dan
        // als gebruiker admin is, laat zien de adminpagina
        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        } else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        } else {
            header.uitgelogd();
        }

        //Load the welcome-content into memory
        profielView = $(data);

        profielView.find('.empty-profile-picture').append("<img src='assets/img/default-profile.png' height='80' width='80'>");
        profielView.find('#naam').text(profile.NAAM);
        profielView.find('#email').append(profile.EMAIL);
        profielView.find('#geslacht').append(profile.GESLACHT);
        profielView.find('#telefoon').append(profile.TELEFOONNUMMER);
        profielView.find('#leeftijd').append(profile.GEBOORTEDATUM);

        mijnInteressesPrinten();
        interessesPrinten();
        bestemmingenPrinten();
        matching();
        mijnMatchesPrinten();

        profielView.find("a").on("click", handleClickMenuItem);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(profielView);
    }


    //Deze functie wordt gebruikt om matches tussen gebruikers te vinden,
    //wanneer er matches zijn worden ze ook geprint onder het kopje 'Mogelijke matches'
    function matching() {
        var gebruiker_id = [session.get('gebruiker_id')];
        gebruiker_id = parseInt(gebruiker_id);

        databaseManager
            .query("SELECT * FROM matches WHERE GEBRUIKER1 = (?) OR GEBRUIKER2 = (?)", [gebruiker_id, gebruiker_id])
            .done(function (dataa) {
                if (dataa == "") {
                    databaseManager
                    //Haal alle gegevens uit database op waarbij de ingelogde gebruiker dezelfde bestemming heeft als een andere gebruiker en check ook of de aankomst datum eerder is dan de vertrek datum
                        .query("SELECT bestemmingen.*, gb2.*, g.NAAM, g.EMAIL, g.GESLACHT, TIMESTAMPDIFF(YEAR , g.GEBOORTEDATUM, CURRENT_DATE) AS GEBOORTEDATUM FROM gebruiker_bestemmingen gb1 INNER JOIN gebruiker_bestemmingen gb2 ON gb1.ID_BESTEMMING = gb2.ID_BESTEMMING AND gb2.ID_GEBRUIKER <> (?) AND gb2.AANKOMST_DATUM <= gb1.VERTREK_DATUM AND gb2.VERTREK_DATUM >= gb1.AANKOMST_DATUM INNER JOIN gebruiker g ON gb2.ID_GEBRUIKER = g.ID_GEBRUIKER INNER JOIN bestemmingen ON gb2.ID_BESTEMMING = bestemmingen.ID_BESTEMMINGEN WHERE gb1.ID_GEBRUIKER = (?) AND g.MATCHED != 1", [gebruiker_id, gebruiker_id])
                        .done(function (data) {
                            var div = profielView.find('.match');
                            var gebruiker2_id;
                            var gebruiker2_bestemmingID;

                            for (var i = 0; i < data.length; i++) {
                                gebruiker2_id = data[i].ID_GEBRUIKER;
                                gebruiker2_bestemmingID = data[i].ID_BESTEMMINGEN;

                                var li = $("<div>")
                                    .addClass("profiel-holder-left")
                                    .data({'gebruiker2_id': gebruiker2_id, 'gebruiker2_bestemmingID': gebruiker2_bestemmingID})
                                    .html('<div class="empty-profile-picture"><img src="assets/img/default-profile.png" height="80" width="80"></div><div class="Naam-vlak" id="naam">' + data[i].NAAM + '</div><div class="Naam-vlak" id="leeftijd">' + data[i].GEBOORTEDATUM + '</div><div class="Naam-vlak" id="geslacht">' + data[i].GESLACHT + '</div><div class="Naam-vlak" id="email">' + data[i].EMAIL + '</div><div class="Naam-vlak" id="bestemming">' + data[i].BESTEMMING + '</div><a href="" class="ProfielGegevensWijzigen" data-controller="ProfielGegevensWijzigen"></a>')
                                    .on("click", function () {
                                        addToMyMatches($(this));
                                        loadController(CONTROLLER_PROFIEL);
                                    });
                                div.append(li);
                            }
                        });
                }
            });
    }

    //Als één van de gebruikers op een match klikt onder het kopje 'Mogelijke matches' dan word deze functie aangeroepen en worden de twee personen ge-insert in de tabel 'matches'.
    function addToMyMatches(element) {

        var gebruiker2_id = element.data('gebruiker2_id');
        var gebruiker2_bestemmingID = element.data('gebruiker2_bestemmingID');
        var gebruiker_ID = [session.get('gebruiker_id')];

        databaseManager
            .query("INSERT INTO matches (GEBRUIKER1, GEBRUIKER2, ID_BESTEMMING) VALUES ((?),(?),(?))", [[gebruiker_ID], [gebruiker2_id], [gebruiker2_bestemmingID]]);

        databaseManager
            .query("UPDATE gebruiker SET MATCHED = 1 WHERE ID_GEBRUIKER = (?) OR ID_GEBRUIKER = (?)", [[gebruiker_ID], [gebruiker2_id]]);
        $(".matches").append(element);
    }

    //Deze functie wordt aangeroepen wanneer een gebruiker op een interesse klikt.
    //De gebruiker en de interesse worden dan ge-insert in de tussentabel 'gebruiker_interesses'
    function addToMyTags(element) {

        var interesse_ID = element.data('interesse_id');
        var gebruiker_ID = [session.get('gebruiker_id')];

        var gebruikerInteresse = [gebruiker_ID, interesse_ID];
        databaseManager
            .query("INSERT INTO gebruiker_interesses (ID_GEBRUIKER, ID_INTERESSES)  VALUES (?)", [gebruikerInteresse]);

        $(".mytags").append(element);
    }

    //Deze functie wordt gebruikt om een match van een gebruiker te printen.
    //Deze functie haalt dus gegevens op uit de 'matches' tabel.
    function mijnMatchesPrinten() {
        databaseManager
            .query("SELECT bestemmingen.*, matches.*, g.ID_GEBRUIKER, g.NAAM, g.EMAIL, g.GESLACHT, TIMESTAMPDIFF(YEAR , g.GEBOORTEDATUM, CURRENT_DATE) AS LEEFTIJD FROM matches INNER JOIN gebruiker g ON matches.GEBRUIKER2 = g.ID_GEBRUIKER OR matches.GEBRUIKER1 = g.ID_GEBRUIKER INNER JOIN bestemmingen ON matches.ID_BESTEMMING = bestemmingen.ID_BESTEMMINGEN WHERE g.ID_GEBRUIKER <> (?) AND (matches.GEBRUIKER1 = (?) OR matches.GEBRUIKER2 = (?)) ", [[session.get("gebruiker_id")], [session.get("gebruiker_id")], [session.get("gebruiker_id")]])
            .done(function (data) {
                if (data != "") {
                    var div = profielView.find('.matches');
                    var gebruiker2_id;

                    for (var i = 0; i < data.length; i++) {
                        gebruiker2_id = data[i].ID_GEBRUIKER;
                        var li = $("<div>")
                            .addClass("profiel-holder-left")
                            .data('gebruiker2_id', gebruiker2_id)
                            .html('<div class="empty-profile-picture"><img src="assets/img/default-profile.png" height="80" width="80"></div><div class="Naam-vlak" id="naam">' + data[i].NAAM + '</div><div class="Naam-vlak" id="leeftijd">' + data[i].LEEFTIJD + '</div><div class="Naam-vlak" id="geslacht">' + data[i].GESLACHT + '</div><div class="Naam-vlak" id="email">' + data[i].EMAIL + '</div><div class="Naam-vlak" id="bestemming">' + data[i].BESTEMMING + '</div><a href="" class="ProfielGegevensWijzigen" data-controller="ProfielGegevensWijzigen"></a>')
                            .on("click", function () {
                                loadController(CONTROLLER_CHAT);
                            });
                        div.append(li);
                    }
                }
            });
    }

    //Deze functie print alle interesses uit de interesses tabel en worden getoond op de profielpagina.
    //Een gebruiker kan op een interesse klikken om die toe te voegen bij 'Mijn interesses'
    function interessesPrinten() {
        var query = "SELECT * FROM interesses ORDER BY INTERESSE ASC";
        var adminData = Array();

        databaseManager
            .query(query)
            .done(function (data) {

                var ul = profielView.find('.tags');

                //Save data[i] in admindata[i]
                for (var i = 0; i < data.length; i++) {
                    adminData[i] = data[i];
                }

                //Print all tags from interest table
                for (var i = 0; i < adminData.length; i++) {
                    var li = $("<li>")
                        .addClass("mytag")
                        .data('interesse_id', adminData[i].ID_INTERESSES)
                        .html(adminData[i].INTERESSE)
                        .on("click", function () {
                            addToMyTags($(this));
                            loadController(CONTROLLER_PROFIEL);
                        });
                    ul.append(li);
                }

            })
            .fail(function (err) {
                console.log(err);
            });
    }

    //Deze functie print alle interesses van de gebruiker die ingelogt is
    function mijnInteressesPrinten() {
        var gebruiker_id = [session.get('gebruiker_id')];
        var interesseData = Array();

        databaseManager
            .query("SELECT gebruiker_interesses.ID_INTERESSES, gebruiker_interesses.ID_GEBRUIKER, interesses.INTERESSE FROM gebruiker_interesses INNER JOIN interesses ON gebruiker_interesses.ID_INTERESSES = interesses.ID_INTERESSES WHERE gebruiker_interesses.ID_GEBRUIKER = (?)", [gebruiker_id])
            .done(function (data) {
                var ul = profielView.find('.mytags');

                for (var i = 0; i < data.length; i++) {
                    interesseData[i] = data[i];
                }

                for (var i = 0; i < interesseData.length; i++) {
                    var li = $("<li>")
                        .addClass("tag")
                        .data('interesse_id', interesseData[i].ID_INTERESSES)
                        .html(interesseData[i].INTERESSE)
                        .on("click", function () {
                            deleteTag($(this));
                            loadController(CONTROLLER_PROFIEL);
                        });
                    ul.append(li);
                }
            })
            .fail(function (err) {
                console.log(err);
            });
    }

    //Deze functie wordt aangeroepen aangeroepen wanneer een ingelogde gebruiker op een interesse klikt zodat de interesse verwijderd word.
    function deleteTag(element) {
        var interesse_ID = element.data('interesse_id');
        var gebruiker_id = [session.get('gebruiker_id')];

        databaseManager
            .query("DELETE FROM gebruiker_interesses WHERE ID_INTERESSES = (?) AND ID_GEBRUIKER = (?)", [interesse_ID, gebruiker_id]);

        $('.tags').append(element);
    }

    //Deze functie print alle bestemmingen van de ingelogde gebruiker.
    //Wanneer er op een bestemming wordt geklikt dan word de bestemming verwijderd
    function bestemmingenPrinten() {
        var gebruiker_id = [session.get('gebruiker_id')];
        var bestemmingenData = Array();

        databaseManager
            .query("SELECT gebruiker_bestemmingen.ID_BESTEMMING, gebruiker_bestemmingen.ID_GEBRUIKER, gebruiker_bestemmingen.AANKOMST_DATUM, gebruiker_bestemmingen.VERTREK_DATUM, bestemmingen.BESTEMMING FROM gebruiker_bestemmingen INNER JOIN bestemmingen ON gebruiker_bestemmingen.ID_BESTEMMING = bestemmingen.ID_BESTEMMINGEN WHERE gebruiker_bestemmingen.ID_GEBRUIKER = (?)", [gebruiker_id])
            .done(function (data) {
                var ul = profielView.find('.mylocations');

                for (var i = 0; i < data.length; i++) {
                    bestemmingenData[i] = data[i];

                    var aankomstDatetime = bestemmingenData[i].AANKOMST_DATUM.toString();
                    var aankomstUnformatted = aankomstDatetime.substring(0, 10);
                    var aankomstSplit = new Array();
                    aankomstSplit = aankomstUnformatted.split('-');
                    var aankomstFormatted = aankomstSplit[2] + '-' + aankomstSplit[1] + '-' +  aankomstSplit[0];

                    var vertrekDatetime = bestemmingenData[i].VERTREK_DATUM.toString();
                    var vertrekUnformatted = vertrekDatetime.substring(0, 10);
                    var vertrekSplit = new Array();
                    vertrekSplit = vertrekUnformatted.split('-');
                    var vertrekFormatted = vertrekSplit[2] + '-' + vertrekSplit[1] + '-' +  vertrekSplit[0];
                }



                for (var j = 0; j < bestemmingenData.length; j++) {
                    var li = $("<li>")
                        .addClass("bestemminginfo")
                        .data('bestemming_id', bestemmingenData[j].ID_BESTEMMING)
                        .html(bestemmingenData[j].BESTEMMING + '<p>Aankomst datum: </p>' + aankomstFormatted + '<p>Vertrek datum: </p>' + vertrekFormatted)
                        .on("click", function () {
                            var bevestig = confirm("Weet u zeker dat u deze bestemming wilt verwijderen?");
                            if (bevestig) {
                                deleteBestemming($(this));
                                loadController(CONTROLLER_PROFIEL);
                            }
                        });
                    ul.append(li);
                }
            })
            .fail(function (err) {
                console.log(err);
            });
    }

    //Deze functie word aangeroepen wanneer een ingelogde gebruiker op een bestemming klikt, de bestemming word dan verwijderd.
    function deleteBestemming(element) {
        var bestemming_ID = element.data('bestemming_id');
        var gebruiker_id = [session.get('gebruiker_id')];

        databaseManager
            .query("DELETE FROM gebruiker_bestemmingen WHERE ID_BESTEMMING = (?) AND ID_GEBRUIKER = (?)", [bestemming_ID, gebruiker_id, gebruiker_id]);

        databaseManager
            .query("DELETE FROM matches WHERE (GEBRUIKER1 = (?) OR GEBRUIKER2 = (?)) AND ID_BESTEMMING = (?)", [gebruiker_id, gebruiker_id, bestemming_ID]);
        element.remove();
    }

    function handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        var controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    //Called when the Profiel.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}