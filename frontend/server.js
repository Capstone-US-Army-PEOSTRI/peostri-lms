const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config()

app.use('/docs', express.static(path.join(__dirname, 'docs')));

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
     res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.APP_PORT || 3000);
console.log("Server is up and running on port: " + process.env.APP_PORT || 3000);
