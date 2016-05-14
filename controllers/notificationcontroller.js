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


module.exports = function(app, route){
                                        return function(req, res, next) {
                                                                          next();
                                                                        };
                                      };

//LoadNotifications
//Load All Notifications
module.exports.LoadNotifications = function(){
                                            logEvent("NotificationController:Load Notifications");
                                            fs.readdirSync(global.notificationDirectory)
                                              .forEach(function(file) {
                                                                         file = global.notificationDirectory+'/'+file;
                                                                         var data = fs.readFileSync(file,'utf8');
                                                                         var alertInfo = JSON.parse(data);
                                                                         if(alertInfo.enabled == 'true'){
                                                                           notificationEngine.RegisterNotification(alertInfo);
                                                                         }
                                                                     });
                                            }

//GetNotifications
//return the list of notifications
module.exports.GetNotifications = function(req,res,next){
                                                          logEvent("NotificationController:GetNotifications");
                                                          var dir = '/opt/API/Notifications/';
                                                          fs.readdirSync(dir)
                                                            .forEach(function(file) {

                                                                                     file = dir+'/'+file;
                                                                                     var stat = fs.statSync(file);

                                                                                     if (stat && stat.isDirectory()) {
                                                                                         results = results.concat(_getAllFilesFromFolder(file))
                                                                                     } else results.push(file);
                                                                                 });
                                                           res.send(results);
                                                           next();
                                                        };

//GetAllNotifications
//Returns a list of all notifications
module.exports.GetAllNotifications = function (){
                                                  logEvent("NotificationController:GeAlltNotifications");
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

//RegisterNotification
module.exports.RegisterNotification= function(req,res,next){
                                                            logEvent("NotificationController:Register Notification:" + req.body.notificationName);
                                                            var alertInfo = req.body;
                                                            notificationEngine.UnregisterNotification(alertInfo);
                                                            notificationEngine.RegisterNotification(alertInfo);
                                                            res.sendStatus('true');
                                                            next();
                                                          }

//UnregisterNotification
module.exports.UnregisterNotification= function(req,res,next){
                                                              logEvent("NotificationController:UnregisterNotification:" + req.body.notificationName);
                                                              var alertInfo = req.body;
                                                              notificationEngine.UnregisterNotification(alertInfo);
                                                              res.sendStatus('true');
                                                              next();
                                                            }

function logEvent(message){
                            if(global.tracelevel == 'debug'){
                                                              console.log(message);
                                                              }
                          }
