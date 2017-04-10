var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');

// Create the application.
var app = express();
function logEvent(message){
                            if(global.tracelevel == 'debug'){
                                                              console.log(message);
                                                              }
                          }

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

                                  var fs, configurationFile;
global.tracelevel = "debug";
configurationFile = 'configuration.json';
fs = require('fs');

var configuration = JSON.parse(
    fs.readFileSync(configurationFile)
);

logEvent(configuration);

global.UbuntuV16 = configuration.UbuntuV16;
global.tracelevel =   configuration.tracelevel;
global.loggingDirectory =   configuration.loggingDirectory;
global.notificationtracelevel = configuration.notificationtracelevel;
global.notificationEngineTrace = configuration.notificationEngineTrace;
global.elastichost =  configuration.elastichost;
global.notificationDirectory = configuration.notificationDirectory;
global.emailConfiguration = configuration.emailConfiguration;
global.defaultInterval = configuration.defaultInterval;
global.telegramChatId = configuration.telegramChatId;
global.telegramAPIKey = configuration.telegramAPIKey;
global.emailEnabled = configuration.emailEnabled;
global.telegramEnabled = configuration.telegramEnabled;

var emailcontroller = require('./controllers/emailcontroller');
var notificationController = require('./controllers/notificationcontroller');
var notificationEngine = require('./controllers/NotificationEngine');

app.all('/RegisterNotification', notificationController.RegisterNotification);
app.all('/UnregisterNotification', notificationController.UnregisterNotification);

//Load the Notification Engine
notificationController.LoadNotifications();

console.log('Listening on port 3003...');
app.listen(3003,'127.0.0.1');
