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


module.exports = function(app, route){
  // Setup the controller for REST;
  return function(req, res, next) {
    next();
  };

};


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


module.exports.RegisterNotification= function(req,res,next)
{
  console.log(req.body);
  var notificationName = req.body.notificationName;
  //read the file
  var alertInfo = req.body.notification;
  console.log(JSON.stringify(alertInfo));
//  notificationEngine.RegisterNotification(alertInfo);
  res.sendStatus('true');
  next();
}
module.exports.UnregisterNotification= function(req,res,next)
{
  var notificationName = req.body.notificationName;
  notificationEngine.UnregisterNotification(notificationName);
  res.sendStatus('true');
  next();
}
