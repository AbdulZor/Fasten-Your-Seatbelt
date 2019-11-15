function profielGegevensWijzigenController() {
    //Reference to our loaded view
    var gegevensWijzigenView;

    function initialize() {
        $.get("views/ProfielGegevensWijzigen.html")
            .done(setup)
            .fail(error);
    }

    //Called when the ProfielGegevensWijzigen.html has been loaded
    function setup(data) {
        //Load the welcome-content into memory
        gegevensWijzigenView = $(data);

        // Check of de gebruiker is ingelogd en veranderd de header dan
        // als gebruiker admin is, laat zien de adminpagina
        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        } else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        } else {
            header.uitgelogd();
        }

        gegevensWijzigenView.find(".updatebutton").on("click", function () {
            updateGegevens();
            //Return false to prevent the form submission from reloading the page.
            return false;
        });

        gegevensWijzigenView.find("#account-verwijderen").on("click", function () {
            var bevestig = confirm("Weet u zeker dat u uw account wilt verwijderen?");
            if (bevestig) {
                deleteAccount();
                handleLogout();
            }
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(gegevensWijzigenView);
    }

    //Deze functie update de gegevens van de gebruiker wanneer de gebruiker op wijzigen klikt
    function updateGegevens() {

        var nieuweEmail = $('#email').val();
        var oudeWachtwoord = $('#wachtwoord').val();
        var nieuweWachtwoord = $('#password').val();
        var confirmWachtwoord = $('#confirm').val();
        var oudeEmailDB = [session.get('email')];
        var oudeWachtwoordDB = [session.get('wachtwoord')];

        //Als de gebruiker niks heeft veranderd voer deze if-statement uit
        if (oudeEmailDB == nieuweEmail && nieuweWachtwoord == "" && confirmWachtwoord == "") {
            alert("Geen wijzigingen! Vul eerst velden in voordat u probeert uw gegevens te wijzigen!");
        }

        //Als alle velden ingevoerd zijn voer deze code uit
        if (nieuweEmail != "" && oudeWachtwoord != "" && nieuweWachtwoord != "" && confirmWachtwoord != "") {
            if (oudeWachtwoord == oudeWachtwoordDB) {
                databaseManager
                    .query("UPDATE gebruiker SET EMAIL = (?), WACHTWOORD = (?) WHERE ID_GEBRUIKER = (?)", [nieuweEmail, nieuweWachtwoord, session.get('gebruiker_id')])
                    .done(function () {
                        alert("Uw gegevens zijn gewijzigd");
                        loadController(CONTROLLER_PROFIEL);
                        session.set("wachtwoord", nieuweWachtwoord);
                        session.set("email", nieuweEmail);
                    }).fail(function (reason) {
                    console.log(reason);
                });
            } else if (oudeWachtwoord != oudeWachtwoordDB) {
                alert("Hudig wachtwoord komt niet overeen")
            }
        }

        //Voer deze code uit wanneer alleen het emailadres wordt gewijzigd en niet het wachtwoord
        if (nieuweWachtwoord == "" && confirmWachtwoord == "" && oudeEmailDB != nieuweEmail) {
            databaseManager
                .query("UPDATE gebruiker SET EMAIL = (?) WHERE ID_GEBRUIKER = (?)", [nieuweEmail, session.get('gebruiker_id')])
                .done(function () {
                    alert("Uw gegevens zijn gewijzigd");
                    loadController(CONTROLLER_PROFIEL);
                    session.set("email", nieuweEmail);
                }).fail(function (reason) {
                console.log(reason);
            });
        }
    }


    //Functie voor een gebruiker om zijn/haar account te verwijderen
    function deleteAccount() {
        var gebruiker_id = [session.get('gebruiker_id')];
        databaseManager
            .query("DELETE FROM gebruiker WHERE ID_GEBRUIKER = (?) ", [gebruiker_id]);
        alert('Uw account is succesvol verwijderd!');
    }

    //Called when the ProfielGegevensWijzigen.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}