const port = 8080;
const hostname = "localhost";
var express = require('express');
var app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('pages/home');
});

app.listen(port);
console.log(`Listening at: http://${hostname}:${port}`);
