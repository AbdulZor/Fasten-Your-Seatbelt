const http = require("http");
const mysql = safeRequire("mysql", "Error: Could not load 'mysql', did you run 'npm install'?");
const config = safeRequire("./config.json", "Error: Could not load 'config.json', please make a copy of 'config.template.json'!");
const users = safeRequire("./users.json", "Error: Could not load 'users.json', please make a copy of 'users.template.json'!");
const nodemailer = safeRequire("nodemailer");
//const socket = safeRequire('socket.io');


const headerAuthorization = "authorization";
const headerAuthorizationPrefix = "Bearer ";

const httpMethodOPTIONS = "OPTIONS";
const httpMethodGET = "GET";
const httpMethodPOST = "POST";

const errorInvalidToken = "Invalid token";
const errorInvalidRequestMethod = "Invalid request method";

const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    //BUGFIX: Some browsers don't properly support wildcards, it seems...
    "Access-Control-Allow-Headers": "Authorization, *"
};

const pools = {};

if (http && mysql && config && users) {
    console.log(http.URL);
    console.log("Starting server...");

    startServer();
}
else {
    console.log("Exiting server due to errors...");
}

function startServer() {
    // console.log("Req: ");
    // console.log("Res: ");
    http
        .createServer(handleRequest)
        .listen(config.server.port, config.server.host);

    console.log(`Listening at ${config.server.host}:${config.server.port}...`);
}

// Socket.io setup
// var io = socket(startServer);
//
// io.on('connection', function () {
//     console.log('made socket connection!');
// });



function sendMail() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: "itsreezhd@gmail.com",
            clientId: "59089710156-uhoucunas1on1o6p5tfrkoapdh1u8qi0.apps.googleusercontent.com",
            clientSecret: "VzB2BXiZQJgNBbJt9spTNdF7",
            refreshToken: "1/AM1_v2n-G-JrpgoSfaTPRdB6ksrU33vMkj37SFAOjEg",
            accessToken: "ya29.GltVBpDpt3XR5LR9pvd97fu_TZZXEdX1DFURLYFRG2MEkznRqlFd8cYlJX3b2lXc6jzNE_19vrYUBJTKVkLSVkVCTNMU_gngOvHEQhLqf2Mw1jidKe18vu9bB-dv",
        },
    });

    var mailOpties = {
        from: "itsreezhd@gmail.com",
        to: "ferran",
        subject: "Hello",
        generateTextFromHTML: true,
        html: "<b>Hello world</b>"
    };

//test of email is verzonden
    transporter.sendMail(mailOpties, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email is verzonden');
        }
        transporter.close();
    });
}

function handleRequest(request, response) {
    console.log("Req: " + request.method);
    console.log("Res: " + response.value);
    try {
        if (request.method === httpMethodOPTIONS || (request.method === httpMethodGET && request.url === "/test")) {
            console.log("SendOK");
            sendOK(response);

            return;
        }

        if (request.method !== httpMethodPOST) {

            sendBadRequest(response, errorInvalidRequestMethod);

            return;
        }

        let authorizationHeader = request.headers[headerAuthorization];

        if (!authorizationHeader || !authorizationHeader.startsWith(headerAuthorizationPrefix)) {
            sendBadRequest(response, errorInvalidToken);

            return;
        }

        let token = authorizationHeader.substr(headerAuthorizationPrefix.length);
        let user = users[token];

        if (!user) {
            sendBadRequest(response, errorInvalidToken);

            return;
        }

        let connectionPool = pools[token];

        if (!connectionPool) {
            connectionPool = mysql.createPool({
                host: config.database.host,
                user: user.username,
                password: user.password,
                database: user.database
            });

            pools[token] = connectionPool;
        }

        handlePOST(request, response, connectionPool);
    }
    catch (e) {
        sendBadRequest(response, e.message);
    }
}

function handlePOST(request, response, connectionPool) {
    let data = [];

    request.on("data", chunk => {
        try {
            data.push(chunk);
        }
        catch (e) {
            throwBadRequest(response, e.message);
        }
    });

    request.on("end", () => {
        try {
            handleQuery(connectionPool, JSON.parse(data), function (data) {
                sendOK(response, data);
            }, function (e) {
                sendBadRequest(response, e.message);
            });
        }
        catch (e) {
            sendBadRequest(response, e.message);
        }
    });
}

function handleQuery(connectionPool, data, successCallback, errorCallback) {
    connectionPool.query({
        sql: data.query,
        values: data.values,
        timeout: config.database.timeout
    }, function (error, results) {
        if (error) {
            errorCallback(error);
        }
        else {
            successCallback(results);
        }
    });
}

function sendOK(response, data) {
    sendJsonResponse(response, 200, data);
}

function sendBadRequest(response, reason) {
    sendJsonResponse(response, 400, {
        reason: reason
    })
}

function sendJsonResponse(response, statusCode, data) {
    response.writeHead(statusCode, defaultHeaders);

    if (data) {
        response.end(JSON.stringify(data));
    }
    else {
        response.end();
    }
}

function safeRequire(module, errorMessage) {
    try {
        return require(module);
    }
    catch (e) {
        console.log(errorMessage);

        return undefined;
    }
}
