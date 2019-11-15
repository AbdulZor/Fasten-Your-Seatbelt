//Global variables
var session = sessionManager();
var databaseManager = databaseManager();
var header;

//Constants(sortof)
var CONTROLLER_LOGIN = "LoginPage";
var CONTROLLER_CHAT = "Chat";
var CONTROLLER_WACHTWOORDVERGETEN = "Wachtwoordvergeten";
var CONTROLLER_LOGOUT = "logout";
var CONTROLLER_ADMIN_LOGIN = "AdminLogin";
var CONTROLLER_ADMIN_HOME = "AdminHomePage";
var CONTROLLER_FAQ = "Faq";
var CONTROLLER_HEADER = "Header";
var CONTROLLER_HOMEPAGE = "Homepage";
var CONTROLLER_PROFIEL = "Profiel";
var CONTROLLER_REGISTREER = "Registreer";
var CONTROLLER_PROFIEL_WIJZIGEN = "ProfielGegevensWijzigen";
var CONTROLLER_HELP = "Help";

//This is called when the browser is done loading
$(function () {
//Setup the databasemanager
//     databaseManager.connect("https://db.fys-hva.tk/");
//     databaseManager.authenticate("eg6ETxj5Fsl34YO0");

//Always load the header
    loadController(CONTROLLER_HEADER);

    loadControllerFromUrl(CONTROLLER_HOMEPAGE);
});

//This function is responsible for creating the controllers of all views
function loadController(name, controllerData) {
    console.log("loadController:" + name);

    if (controllerData) {
        console.log(controllerData);
    }
    else {
        controllerData = {};
    }

    switch (name) {
        case CONTROLLER_CHAT:
            setCurrentController(name);
            isLoggedIn(chatController, loginController);
            break;

        case CONTROLLER_ADMIN_HOME:
            setCurrentController(name);
            adminHomeController();
            break;

        case CONTROLLER_LOGIN:
            setCurrentController(name);
            loginController();
            break;

        case CONTROLLER_LOGOUT:
            setCurrentController(name);
            handleLogout();
            break;

        case CONTROLLER_ADMIN_LOGIN:
            setCurrentController(name);
            adminHomeController();
            break;

        case CONTROLLER_FAQ:
            setCurrentController(name);
            faqController();
            break;

        case CONTROLLER_HEADER:
            header = headerController();
            break;

        case CONTROLLER_HOMEPAGE:
            setCurrentController(name);
            homepageController();
            break;

        case CONTROLLER_PROFIEL:
            setCurrentController(name);
            isLoggedIn(profielController, loginController);
            break;

        case CONTROLLER_REGISTREER:
            setCurrentController(name);
            registreerController();
            break;

        case CONTROLLER_WACHTWOORDVERGETEN:
            setCurrentController(name);
            wachtwoordvergetenController();
            break;

        case CONTROLLER_PROFIEL_WIJZIGEN:
            setCurrentController(name);
            profielGegevensWijzigenController();
            break;

        case CONTROLLER_HELP:
            setCurrentController(name);
            helpController();
            break;


        default:
            return false;
    }

    return true;
}

function loadControllerFromUrl(fallbackController) {
    var currentController = getCurrentController();

    if (currentController) {
        if (!loadController(currentController)) {
            loadController(fallbackController);
        }
    }
    else {
        loadController(fallbackController);
    }
}


function getCurrentController() {
    return location.hash.slice(1);
}

function setCurrentController(name) {
    location.hash = name;
}

//Convenience functions to handle logged-instates
function isLoggedIn(whenYes, whenNo) {
    if (session.get("username")) {
        whenYes();
    }
    else {
        whenNo();
        console.log("When no");

    }
}

function handleLogout() {
    session.clear("username");
    session.clear("gebruiker_id");
    session.clear("gebruiker_admin");
    session.clear("email");
    session.clear("wachtwoord");
    loadController(CONTROLLER_LOGIN);
    //header.uitgelogd();
}
