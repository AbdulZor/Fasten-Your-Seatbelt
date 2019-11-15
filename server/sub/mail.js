//Gebruik nodemailer module om mail te versturen
const nodemailer = safeRequire('nodemailer');

//Gebruik OAuth 2 om toegang te krijgen tot Google API
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user:"itsreezhd@gmail.com",
        clientId:"59089710156-uhoucunas1on1o6p5tfrkoapdh1u8qi0.apps.googleusercontent.com",
        clientSecret:"VzB2BXiZQJgNBbJt9spTNdF7",
        refreshToken:"1/AM1_v2n-G-JrpgoSfaTPRdB6ksrU33vMkj37SFAOjEg",
        accessToken: "ya29.GltVBpDpt3XR5LR9pvd97fu_TZZXEdX1DFURLYFRG2MEkznRqlFd8cYlJX3b2lXc6jzNE_19vrYUBJTKVkLSVkVCTNMU_gngOvHEQhLqf2Mw1jidKe18vu9bB-dv",
    },
});

var mailOpties = {
    from: "itsreezhd@gmail.com",
    to: "",
    subject: "Dit werkt via mail.js",
    generateTextFromHTML: true,
    html: "<b>Hello world</b>"
};

//test of email is verzonden
transporter.sendMail(mailOpties, function(error) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email is verzonden');
    }
    transporter.close();
});

