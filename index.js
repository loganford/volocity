var http = require('http')
var fs = require('fs')

var express = require('express')
var app = express()

app.use('/unthscpa', express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
  res.redirect('/unthscpa')
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
})