const http = require("http");
const app = require("../app");
const mysql = require("mysql");
const pug = require('pug');

exports.home = function() {
    return { test: "Hallo, dit werkt in ieder geval" };
}


