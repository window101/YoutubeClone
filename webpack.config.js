
const path = require("path");


module.exports = {
    entry: "./src/client/js/main.js",
    output: {
        filename: "main.js",
        
        path: path.resolve(__dirname, "assets", "js"),
    },
};


