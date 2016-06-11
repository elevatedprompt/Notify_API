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

global.tracelevel =   'debug';
global.elastichost =  '127.0.0.1:9200';
global.notificationDirectory = '/opt/API/Notifications/';
global.emailConfiguration =   {
                               user:        "ep.alert.test@gmail.com",
                               password:    "TestinEP",
                               host:        "smtp.gmail.com",
                               ssl:         true,
                               fromSender:  "No Tify <EP.Alert.Test@gtmail.com>"
                              };

var emailcontroller = require('./controllers/emailcontroller');
var notificationController = require('./controllers/notificationcontroller');
var notificationEngine = require('./controllers/NotificationEngine');

app.all('/RegisterNotification', notificationController.RegisterNotification);
app.all('/UnregisterNotification', notificationController.UnregisterNotification);

//Load the Notification Engine
notificationController.LoadNotifications();

console.log('Listening on port 3003...');
app.listen(3003,'127.0.0.1');
