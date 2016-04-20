/*
EPNotificationController controller

Methods
List Notifications
RegisterNotifications
UpdateNotification
EvaluateNotification


*/
var Resource = require('resourcejs');
var fs = require ('fs');
var elasticsearch = require("elasticsearch");
var notificationEngine = require("./NotificationEngine");
var notificationDirectory = "/opt/API/Notifications/";

module.exports = function(app, route){
  // Setup the controller for REST;
  return function(req, res, next) {
    next();
  };
};

//Load All Notifications
module.exports.LoadNotifications = function(){
  console.log("Load Notifications");

fs.readdirSync(notificationDirectory)
  //For each notification in the list
  .forEach(function(file) {
     file = notificationDirectory+'/'+file;
     var data = fs.readFileSync(file,'utf8');
     var alertInfo = JSON.parse(data);
//     console.log(alertInfo);
     if(alertInfo.enabled == 'true'){
       notificationEngine.RegisterNotification(alertInfo);
       //Register the Notification with the Notification Engine
     }
//     console.log(alertInfo);
 });
}


//return the list of notifications
module.exports.GetNotifications = function(req,res,next)
{
  var dir = '/opt/API/Notifications/';
  fs.readdirSync(dir)
    .forEach(function(file) {

       file = dir+'/'+file;
       var stat = fs.statSync(file);

       if (stat && stat.isDirectory()) {
           results = results.concat(_getAllFilesFromFolder(file))
       } else results.push(file);
   });

   console.log('Get Notifiation File List');
   console.log(results);
   res.send(results);
   next();
};


//Returns a list of all notifications
module.exports.GetAllNotifications = function ()
{
  var notifications = [];
  var dir = '/opt/API/Notifications/';
  fs.readdirSync(dir)
    .forEach(function(file) {
       var data = fs.readFileSync(file,'utf8');
       var obj = JSON.parse(data);
       notificaitons.push(obj);
   });

  return notifications;
}

module.exports.RegisterNotification= function(req,res,next)
{
  //console.log(req.body);
  console.log("Register Notification:" + req.body.notificationName);

  //read the file
  var alertInfo = req.body;

  //unregister notification first to prevent duplicate events.
  notificationEngine.UnregisterNotification(alertInfo);
  notificationEngine.RegisterNotification(alertInfo);
  res.sendStatus('true');
  next();
}

module.exports.UnregisterNotification= function(req,res,next)
{
  var alertInfo = req.body;
  console.log("Unregister Called: " + req.body.notificationName);

  notificationEngine.UnregisterNotification(alertInfo);
  res.sendStatus('true');
  next();
}
