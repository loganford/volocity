var http = require('http')
var fs = require('fs')

var express = require('express')
var app = express()

app.use('/untpa', express.static(__dirname + '/public'));

// app.get('/', function (req, res) {
//   res.redirect('/untpa')
// })

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})