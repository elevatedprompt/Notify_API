/*!
* Copyright(c) 2016 elevatedprompt
*
* Author: Colin Goss
 * @ngdoc function
 * @name EPStack API
 * @description
 */
var alertInfos = [];
var suspendedAlertInfos = [];
var emailManager = require('./emailcontroller');
var telegramManager = require('./TelegramController');
var es = require('./elasticquery');
var fs = require('fs')

var EP_EventEmitter = function() {
                                    this.events = {};
                                  };

EP_EventEmitter.prototype.on = function(eventname, callback) {
                                                                this.events[eventname] || (this.events[eventname] = []);
                                                                this.events[eventname].push(callback);
                                                              };

EP_EventEmitter.prototype.emit = function(eventname) {
                                                        var args = Array.prototype.slice.call(arguments, 1);
                                                        if (this.events[eventname]) {
                                                          this.events[eventname].forEach(function(callback) {
                                                                                        callback.apply(this, args);
                                                                                      });
                                                                                    }
                                                      };

var emitter = new EP_EventEmitter();

//Event Implementation

//ThresholdMet
//A threshold has been met
//The search rowcount has passed the notification threshold.
emitter.on('Any', function(alertInfo) {
                                              logEvent("NotificationEngine=>Any Threshold Met fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);
                                              es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
                                              .then(function(result){
                                                                    logEvent(JSON.stringify(result));
                                                                      if(result.total > 0){
                                                                        logEvent("Any Threshold Met!")
                                                                        var triggerTime = new Date();
                                                                        alertInfo.triggerTime = triggerTime;
                                                                        emailEvent(alertInfo, result,triggerTime);
                                                                        emitter.emit("EventTriggered", alertInfo);
                                                                      }
                                                                      else {
                                                                        logEvent("Threshold not Met!")
                                                                      }
                                                                  },function(error){
                                                                    logEvent('Error in EvaluateSearchInternal: Alert:' + alertInfo.notificationName);
                                                                    logEvent(error.message);
                                                                  });
                                            });

//FloorEvent
//The rowcount for the search query has dropped below the expected value.
//This function is usefull for validating expected levels
emitter.on('Min', function(alertInfo) {
                                            logEvent("Greater Than Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

                                            es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
                                            .then(function(result){
                                                                    logEvent(JSON.stringify(result));
                                                                    if(result.total >= parseInt(alertInfo.thresholdCount,10)){
                                                                      logEvent("> Condition Met!")
                                                                      var triggerTime = new Date();
                                                                      alertInfo.triggerTime = triggerTime;
                                                                      emailEvent(alertInfo, result,triggerTime);
                                                                      emitter.emit("EventTriggered", alertInfo);
                                                                    }
                                                                    else {
                                                                      logEvent("> Condition not Met!")
                                                                    }
                                                                },function(error){
                                                                  logEvent('Error in EvaluateSearchInternal: Alert:' + alertInfo.notificationName);
                                                                  logEvent(error.message);
                                                                });
                                          });

//CeilingEvent
//Max record count hit for a given search based on the timeframe.
emitter.on('Max', function(alertInfo) {
                                              logEvent("NotificationEngine:Less Than Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

                                              es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
                                              .then(function(result){
                                                                        logEvent(JSON.stringify(result));
                                                                        if(result.total <= parseInt(alertInfo.thresholdCount,10)){
                                                                          logEvent("< Condition Met!")
                                                                          //retrieve the result set.
                                                                          var triggerTime = new Date();
                                                                          emailEvent(alertInfo, result,triggerTime);
                                                                          emitter.emit("EventTriggered", alertInfo);
                                                                        }
                                                                        else {
                                                                          console.log("< Condition not Met!")
                                                                        }
                                                                    },function(error){
                                                                      logEvent('Error in EvaluateSearchInternal: Alert:' + alertInfo.notificationName);
                                                                      logEvent(error.message);
                                                                    });
                                            });



//pause the interval
//create a timeout for the set timeFrame - 1 minutes
//enable the interval
emitter.on('EventTriggered',function(alertInfo){
                                                var timeInterval = (alertInfo.timeValue * 60000);
                                                if(alertInfo.timeFrame == "d"){
                                                    timeInterval = ((alertInfo.timeValue * 60)*60000);
                                                  }
                                                logEvent("Event Triggered suspending intervalObject for " + alertInfo.timeValue + " " + alertInfo.timeFrame);
                                                emitter.emit("UnRegister", alertInfo);
                                                //add event to list of suspended events
                                                suspendedAlertInfos.push(alertInfo);

                                                setTimeout(function(alertInfo){
                                                  //check to see if the alert is in the suspended list.
                                                  if(IsSuspended(alertInfo)){
                                                    if(IsRunableAlert(alertInfo)){
                                                      var alertInfo = ReInstate(alertInfo);
                                                    //confirm the alert is in the list of registered alerts before resurecing
                                                      logEvent("Timer ReRegistered: " + alertInfo.notificationName)
                                                      emitter.emit("Register", alertInfo);
                                                    }
                                                  }

                                                },timeInterval,alertInfo);
                                                });
//Register
//Register and setup interval for monitor
emitter.on('Register',function(alertInfo){
                                          logEvent("NotificationEngine=>event Listiner Registered: " + alertInfo.notificationName);

                                          if(!IsSuspended(alertInfo)){
                                                                    emitter.emit(alertInfo.thresholdType,alertInfo);//run the check immediately
                                                                    var intervalObject = setInterval(function(alertInfo){
                                                                                                                          //Emit the threshold type to be evaluated
                                                                                                                          logEvent("NotificationEngine=>Interval Hit:" + alertInfo.notificationName);
                                                                                                                          emitter.emit(alertInfo.thresholdType,alertInfo);
                                                                                                                        },alertInfo.checkFreq*60000||300000,alertInfo);
                                                                    alertInfo.intervalObject = intervalObject;
                                                                    alertInfos.push(alertInfo);
                                                                  }
                                        });

//Unregister
//stop the timer and remove the object from the list
emitter.on('UnRegister',function(alertInfo){
                                              logEvent("NotificationEngine=>event Listiner Unregistered: " + alertInfo.notificationName);
                                              removeAlert(alertInfo);
                                            });
function removeAlert(alertInfo){
                              logEvent('Pre Delete Registered Alert Count:' + alertInfos.length);
                                for (var i = 0; i < alertInfos.length; i++) {
                                  if(alertInfo.notificationName == alertInfos[i].notificationName){
                                    clearInterval(alertInfos[i].intervalObject);
                                    alertInfos.splice(i,1);
                                    continue;
                                  }
                                }
                              logEvent('Post Delete Registered Alert Count:' + alertInfos.length);
                              }
//Unref
emitter.on('ClearInterval',function(alertInfo){
                                                logEvent("NotificationEngine=>Clear Interval" + alertInfo.notificationName);
                                                clearInterval(alertInfo.intervalObject);//Stop the interval from happening
                                              });

//emailEvent
function emailEvent(alert,result,triggerTime){
                                                logEvent("NotificationEngine=>emailEvent");
                                                if(global.emailEnabled == true && alert.notifyEmail != ''){
                                                                          emailManager.SendEventMail(alert,result,triggerTime);
                                                                          }
                                                if(global.telegramEnabled == true && alert.telegramChatId != ''){
                                                                          telegramManager.SendTelegramEvent(alert,result,triggerTime);
                                                                          }
                                              }

function emailResultEvent(alert,result,valuableResults){
                                                          logEvent("NotificationEngine=>emailResultEvent");
                                                          emailManager.SendResultEventMail(alert,result,valuableResults);
                                                        }


//UnregisterEventMonitor
//Internal method.
function UnregisterEventMonitor(alertInfo){
                                            removeAlert(alertInfo);
                                            //clearInterval(alertInfo.intervalObject);
                                            //emitter.emit('UnRegister',alertInfo);
                                          }
function IsSuspended(alertInfo){
                              for (var i = 0; i < suspendedAlertInfos.length; i++) {
                                if(suspendedAlertInfos[i].notificationName == alertInfo.notificationName){
                                  return true;
                                  }
                              }
                              return false;
                            }
function ReInstate(alertInfo){
                              logEvent('Notification request for Reinstatment: ' + alertInfo.notificationName);
                              for (var i = 0; i < suspendedAlertInfos.length; i++) {
                                if(suspendedAlertInfos[i].notificationName == alertInfo.notificationName){
                                  if(suspendedAlertInfos[i].timeStamp != alertInfo.timeStamp){
                                      var returnInfo = suspendedAlertInfos[i];
                                      suspendedAlertInfos.splice(i,1);
                                      return returnInfo;
                                    }
                                    suspendedAlertInfos.splice(i,1);
                                    break;
                                  }
                              }
                              return alertInfo;
                            }
function RegisterSuspended(alertInfo){
                                      for (var i = 0; i < suspendedAlertInfos.length; i++) {
                                        if(suspendedAlertInfos[i].notificationName == alertInfo.notificationName){
                                          if(suspendedAlertInfos[i].timeStamp != alertInfo.timeStamp){
                                            suspendedAlertInfos[i] = alertInfo;
                                            break;
                                            }
                                          }
                                      }
                                    }
function IsRunableAlert(alertInfo){
                                logEvent("NotificationEngine=>Check Runable Notification");
                                var returnVal = false;
                                fs.readdirSync(global.notificationDirectory)
                                  .forEach(function(file) {

                                                             file = global.notificationDirectory+'/'+file;
                                                             var data = fs.readFileSync(file,'utf8');
                                                             var alertInfoFile = JSON.parse(data);
                                                             if(alertInfo.notificationName == alertInfoFile.notificationName)
                                                             if(alertInfo.enabled == 'true'){
                                                               logEvent('Notification is enabled.');
                                                               returnVal = true;
                                                               return returnVal;
                                                             }
                                                             else {
                                                                logEvent('Notification is disabled.');
                                                                returnVal = false;
                                                               return returnVal;
                                                             }
                                                         });
                                  logEvent(returnVal);
                                  return returnVal;
                                }
//RegisterNotification
//emit's an event to register the alertInfo
module.exports.RegisterNotification = function(alertInfo){

                                                          //check to see if the alert is suspended.
                                                          if(!IsSuspended(alertInfo)){
                                                                                    logEvent('NotificationEngine=>Register Notification');
                                                                                    emitter.emit('Register',alertInfo);
                                                                                    }
                                                                                    else{
                                                                                      logEvent('NotificationEngine=>Register Suspended');
                                                                                      RegisterSuspended(alertInfo);
                                                                                    }
                                                          }

//UnregisterNotification
//Unregiser the event.
module.exports.UnregisterNotification = function(notification){
                                                                logEvent('NotificationEngine=>Unregister Notification: ' + notification.notificationName);
                                                                logEvent('Registered Alert Count:' + alertInfos.length);
                                                                logEvent('suspended Alert Count:' + suspendedAlertInfos.length);
                                                                if(alertInfos.length==0)
                                                                  return true;

                                                                for (var i = 0; i < alertInfos.length; i++) {
                                                                  if(alertInfos[i].notificationName == notification.notificationName){
                                                                      emitter.emit('UnRegister',alertInfos[i]);
                                                                      return true;
                                                                    }
                                                                }
                                                                return true;
                                                              }
function logEvent(message){
                            if(global.tracelevel == 'debug'||global.notificationtracelevel=='debug'){
                                                            console.log(message);
                                                            }
                            if(global.notificationEngineTrace=='debug'){
                                                            fs.appendFile(global.loggingDirectory + '/notificationEngineLog.log', "\r\n" + new Date().toISOString()
                                                                                                              .replace(/T/, ' ')
                                                                                                              .replace(/\..+/, '') + " NotifyEngine " + message, function (err) {
                                                              });
                            }
                          }
