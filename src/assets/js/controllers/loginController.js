/**
 * Responsible for handling the actions happening on login view
 *
 * @author Lennard Fonteijn
 */
function loginController() {
    //Reference to our loaded view
    var loginView;

    function initialize() {
        $.get("views/LoginPage.html")
            .done(setup)
            .fail(error);
    }

    //Called when the login.html has been loaded
    function setup(data) {
        //Load the login-content into memory
        loginView = $(data);

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
        loginView.find("a").on("click", handleClickMenuItem);

        // als er op de login/submit button wordt geklikt
        // voor de functie handleLogin()
        loginView.find(".login-form").on("submit", function () {
            handleLogin();

            //Return false to prevent the form submission from reloading the page.
            return false;
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(loginView);

        loginView.find("a").on("click", handleClickMenuItem);
    }

    function handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        var controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    // handle de login door te kijken in de database naar de gegevens die ingevoerd zijn in de inputs
    // als dat zo is haal dan de gegevens op van de user en zet de session aan op en geef mee aan de session
    // de usernaam, userID, het wachtwoord en of de user een admin is of niet
    function handleLogin() {
        //Find the username and password
        var username = loginView.find("[name='username']").val();
        var password = loginView.find("[name='password']").val();

        var databaseUsername = "SELECT ID_GEBRUIKER, NAAM, ADMIN, EMAIL FROM fys_is105_4.gebruiker WHERE NAAM = ?";
        var databasePassword = "SELECT WACHTWOORD FROM fys_is105_4.gebruiker WHERE NAAM = (?)";

        var wachtwoord;
        //Attempt to login
        if (username != "" && password != "") {
            databaseManager
                .query(databaseUsername, [username])
                .done(function (data) {
                    if (data != "") {
                        if (data[0].NAAM == username) {
                            var gebruiker_id = data[0].ID_GEBRUIKER;
                            var gebruiker_admin = data[0].ADMIN;
                            var gebruiker_email = data[0].EMAIL;
                            databaseManager.query(databasePassword, [username]).done(function (data) {
                                wachtwoord = data[0].WACHTWOORD;
                                if (password != wachtwoord) {
                                    loginView.find(".error").html("Onjuiste watchtwoord!");
                                } else {
                                    session.set("username", username);
                                    session.set("gebruiker_id", gebruiker_id);
                                    session.set("gebruiker_admin", gebruiker_admin);
                                    session.set("email", gebruiker_email);
                                    session.set("wachtwoord", wachtwoord);
                                    if (gebruiker_admin == 0) {
                                        header.ingelogd();
                                        loadController(CONTROLLER_PROFIEL);
                                    } else {
                                        header.ingelogdAdmin();
                                        loadController(CONTROLLER_ADMIN_HOME);
                                    }
                                }
                            })
                        }
                    } else {
                        loginView.find(".error").html("<p>Onjuiste gebruikersnaam!</p>");
                    }
                })
                .fail(function (reason) {
                    console.log(reason);
                });
        } else
            loginView.find(".error").html("Vul alle gegevens in!");
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}