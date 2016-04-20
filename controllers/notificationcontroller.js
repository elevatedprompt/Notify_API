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
//var moment = require('moment-timezone');
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
//Load Notifications
console.log(notificationDirectory);
//var notificationDirectory = '/opt/API/Notifications/';

fs.readdirSync(notificationDirectory)
//For each notification in the list
  .forEach(function(file) {

     file = notificationDirectory+'/'+file;
     var data = fs.readFileSync(file,'utf8');
     var alertInfo = JSON.parse(data);
     console.log(alertInfo);
     if(alertInfo.enabled == 'true'){
       console.log('Notification Enabled');
       notificationEngine.RegisterNotification(alertInfo);
     }
     console.log(alertInfo);

 });

//Register the Notification with the Notification Engine

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


// $scope.NotificationList = [
//   {NotifyID:"1",SearchID:"1",Threshold:"2",Period:""}//Period in minutes.
//   {NotifyID:"2",SearchID:"1",Threshold:"2",Period:""}
//   {NotifyID:"3",SearchID:"2",Threshold:"2",Period:""}
//   {NotifyID:"4",SearchID:"3",Threshold:"2",Period:""}
// ];
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

module.exports.RegisterNotification= function(notification,next)
{
  console.log("Register Notification Called");

  console.log(notification);
  var notificationName = req.body.notificationName;
  console.log("Register Notification:" + notificationName);
  //read the file
  var alertInfo = req.body.notification;

  console.log(JSON.stringify(alertInfo));
  //unregister notification first to prevent duplicate events.
  notificationEngine.UnregisterNotification(notificationName);
//  notificationEngine.RegisterNotification(alertInfo);
  res.sendStatus('true');
  next();
}

module.exports.UnregisterNotification= function(notification,next)
{
  console.log("UnRegister Notification");
  console.log(JSON.stringify(notification));
  var notificationName = req.body.notificationName;
  console.log("Unregister Called: " + notificationName);

  notificationEngine.UnregisterNotification(notificationName);
  res.sendStatus('true');
  next();
}
