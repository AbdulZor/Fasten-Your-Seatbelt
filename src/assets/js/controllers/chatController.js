function chatController() {
    //Reference to our loaded view
    var chatView;
    var user1id;
    var user1naam;
    var bericht;
    var user2id;
    var user2naam;

    function initialize() {
        $.get("views/Chat.html")
            .done(setup)
            .fail(error);
    }

    //Called when the welcome.html has been loaded
    function setup(data) {
        //Load the welcome-content into memory
        chatView = $(data);

        showNaamMatch();
        getUser2Id();
        getChats();

        // Check of de gebruiker is ingelogd en veranderd de header dan
        // als gebruiker admin is, laat zien de adminpagina
        if (session.get("gebruiker_admin") == 0) {
            header.ingelogd();
        } else if (session.get("gebruiker_admin") == 1) {
            header.ingelogdAdmin();
        } else {
            header.uitgelogd();
        }

        // als er op het verstuur button gedrukt sla dat op in de database
        chatView.find('.verstuurbutton').on('click', function () {
            sendChat();
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(chatView);

    }

    // haal de ID van de 2de gebruiker (de gematchte gebruiker) uit de database
    function getUser2Id() {
        databaseManager
            .query("SELECT DISTINCT matches.*, g.ID_GEBRUIKER, g.NAAM, g.EMAIL, g.GESLACHT, TIMESTAMPDIFF(YEAR , g.GEBOORTEDATUM, CURRENT_DATE) AS LEEFTIJD FROM matches INNER JOIN gebruiker g ON matches.GEBRUIKER2 = g.ID_GEBRUIKER OR matches.GEBRUIKER1 = g.ID_GEBRUIKER WHERE g.ID_GEBRUIKER <> (?) AND (matches.GEBRUIKER1 = (?) OR matches.GEBRUIKER2 = (?)) ", [[session.get("gebruiker_id")], [session.get("gebruiker_id")], [session.get("gebruiker_id")]])
            .done(function (data) {
                user2id = (data[0].ID_GEBRUIKER);
            });
    }

    // Haal de chats op en laat het zien op de pagina
    // de chats zijn van de gematchte koppel mbv de getUser2ID()
    function getChats() {
        user1id = session.get('gebruiker_id');
        user1naam = session.get('username');
        var queryChats = "SELECT chat.ID_BERICHT, chat.VAN, chat.NAAR, chat.DATUM, chat.BERICHT, g1.NAAM FROM chat INNER JOIN gebruiker g1 ON g1.ID_GEBRUIKER = chat.VAN INNER JOIN gebruiker g2 ON g2.ID_GEBRUIKER = chat.VAN WHERE (chat.VAN = (?) OR chat.NAAR = (?)) AND  (chat.VAN = (?) OR chat.NAAR = (?) ) ORDER BY DATUM ASC";
        var queryUser2 = "SELECT NAAM FROM gebruiker WHERE ID_GEBRUIKER = (?)";
        databaseManager
            .query(queryUser2, user1id)
            .done(function (data) {
                user2naam = data[0].NAAM;
                databaseManager
                    .query(queryChats, [user1id, user1id, user2id, user2id])
                    .done(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].VAN === user1id) {
                                chatView.find('.berichten').append("<p class='berichtenP'>" + data[i].BERICHT + "</p></br><div class='clearer'></div>");
                                $('.berichtenP').css({
                                    'float': 'right',
                                    'max-width': '50%',
                                    'text-align': 'left',
                                    'background-color': '#ff3b49',
                                    'padding': '5px',
                                    'border-radius': '10px'
                                });
                            } else {
                                chatView.find('.berichten').append("<p class='berichtenPE'>" + data[i].BERICHT + "</p></br><div class='clearer'></div>");
                                $('.berichtenPE ').css({
                                    'float': 'left',
                                    'color': 'black',
                                    'text-align': 'left',
                                    'background': '#FFF1BE',
                                    'padding': '5px',
                                    'border-radius': '10px'
                                });
                            }
                        }
                    })
                    .fail(function (err) {
                        console.log(err);
                    });
            })
            .fail(function (err) {
                console.log(err)
            });
    }

    // verstuur de chatbericht naar de database en laad de pagina opnieuw
    function sendChat() {
        var chatVal = $('.chat-invoer').val();

        if (chatVal !== "") {
            databaseManager
                .query("SELECT DISTINCT g.ID_GEBRUIKER FROM matches INNER JOIN gebruiker g ON matches.GEBRUIKER2 = g.ID_GEBRUIKER OR matches.GEBRUIKER1 = g.ID_GEBRUIKER WHERE g.ID_GEBRUIKER <> (?) AND (matches.GEBRUIKER1 = (?) OR matches.GEBRUIKER2 = (?)) ", [[session.get("gebruiker_id")], [session.get("gebruiker_id")], [session.get("gebruiker_id")]])
                .done(function (data) {
                    user2id = (data[0].ID_GEBRUIKER);
                    databaseManager
                        .query("INSERT INTO chat (VAN, NAAR, DATUM, BERICHT) VALUES ((?),(?),CURRENT_DATE,(?))", [[session.get("gebruiker_id")], [user2id], [chatVal]]);

                    $('.berichtenP').append("<p class='berichtenP'>" + bericht + "</p>");
                    loadController(CONTROLLER_CHAT);
                });
        }
    }

    function showNaamMatch() {
        databaseManager
            .query("SELECT DISTINCT g.NAAM FROM matches INNER JOIN gebruiker g ON matches.GEBRUIKER2 = g.ID_GEBRUIKER OR matches.GEBRUIKER1 = g.ID_GEBRUIKER WHERE g.ID_GEBRUIKER <> (?) AND (matches.GEBRUIKER1 = (?) OR matches.GEBRUIKER2 = (?))", [[session.get("gebruiker_id")], [session.get("gebruiker_id")], [session.get("gebruiker_id")]])
            .done(function (data) {

                $('.Chat-holder').append("<h2><i>" + data[0].NAAM + "</i></h2>");
            });
    }

    //Called when the chat.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}