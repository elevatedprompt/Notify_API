var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');

// Create the application.
var app = express();

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
// CORS Support
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});


var emailcontroller = require('./controllers/emailcontroller');
var notificationController = require('./controllers/notificationcontroller');
var elasticquery = require('./controllers/elasticquery');
var notificationEngine = require('./controllers/NotificationEngine');

//var notifications = notificationController.GetAllNotifications();
app.all('/testQuery',elasticquery.testQuery);
//app.all('/testSearchExists',elasticquery.testSearchExists);


//ElasticSearch Controller
app.all('/ListSearches',elasticquery.ListSearches)
app.all('/runSearch',elasticquery.runSearch);
app.all('/getQuery',elasticquery.getQuery);
app.all('/CallQuery',elasticquery.CallQuery);
app.all('/EvaluateSearch',elasticquery.EvaluateSearch);
app.all('/PingCluster',elasticquery.pingCluster)
//app.all('/CallQueryStep1',elasticquery.CallQueryStep1);

app.all('/RegisterNotification', notificationController.RegisterNotification);
app.all('/UnregisterNotification', notificationController.UnregisterNotification);

//Email Controller
app.all('/testEmail',emailcontroller.testEmail);
//app.all('/sendMessage',emailcontroller.sendMessage);
app.all('/SendMail',emailcontroller.SendMail);

console.log('Listening on port 3003...');
//Load the Notification Engine
notificationController.LoadNotifications();
//app.listen(3003);
app.listen(3003,'127.0.0.1');
//get list of notifications.


//https://nodejs.org/api/timers.html

//TODO: Add test to register timer events.
// var immediateObject = setInterval(function(){
//   console.log('timmer tick');
// },20000);
//
// var immediateObject2 = setInterval(function(){
//  console.log('timmer 2 Tick');
//},6000);
//immediateObject.ref();
//immediateObject.unref();

//for all notifications evaluate the notification.
