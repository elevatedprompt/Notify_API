var alertInfos = [];
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
                                                setTimeout(function(alertInfo){
                                                    logEvent("Timer ReRegistered: " + alertInfo.notificationName)
                                                    emitter.emit("Register", alertInfo);
                                                },timeInterval,alertInfo);
                                                });
//Register
//Register and setup interval for monitor
emitter.on('Register',function(alertInfo){
                                          logEvent("NotificationEngine=>event Listiner Registered: " + alertInfo.notificationName);
                                          emitter.emit(alertInfo.thresholdType,alertInfo);//run the check immediately
                                          var intervalObject = setInterval(function(alertInfo){
                                                                                                //Emit the threshold type to be evaluated
                                                                                                logEvent("NotificationEngine=>Interval Hit:" + alertInfo.notificationName);
                                                                                                emitter.emit(alertInfo.thresholdType,alertInfo);
                                                                                              },alertInfo.checkFreq*60000||300000,alertInfo);
                                          alertInfo.intervalObject = intervalObject;
                                          alertInfos.push(alertInfo);
                                        });

//Unregister
//stop the timer and remove the object from the list
emitter.on('UnRegister',function(alertInfo){
                                              logEvent("NotificationEngine=>event Listiner Unregistered: " + alertInfo.notificationName);
                                              removeAlert(alertInfo);
                                            });
function removeAlert(alertInfo){
                              logEvent('Pre Delete Registered Alert Count:' + alertInfos.length);
                              forEach(info in alertInfos)
                              {
                                if(alertInfo.notificationName == info.notificationName){
                                  clearInterval(info.intervalObject);
                                  logEvent(alertInfos.indexOf(info));
                                  //delete alertInfos[alertInfos.indexOf(info)-1];
                                  }
                              }

                            //  logEvent(alertInfos.indexOf(alertInfo));


                              delete alertInfos[alertInfos.indexOf(alertInfo)-1];
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
                                                if(global.emailEnabled == true){
                                                                          emailManager.SendEventMail(alert,result,triggerTime);
                                                                          }
                                                if(global.telegramEnabled == true){
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

//RegisterNotification
//emit's an event to register the alertInfo
module.exports.RegisterNotification = function(alertInfo){
                                                          logEvent('NotificationEngine=>Register Notification');
                                                          emitter.emit('Register',alertInfo);
                                                        }

//UnregisterNotification
//Unregiser the event.
module.exports.UnregisterNotification = function(notification){
                                                                logEvent('NotificationEngine=>Unregister Notification: ' + notification.notificationName);
                                                                logEvent('Registered Alert Count:' + alertInfos.length);
                                                                if(alertInfos.length==0)
                                                                  return true;
                                                                forEach(alertInfo in alertInfos)
                                                                {
                                                                  logEvent(alertInfo);
                                                                  if(alertInfo.notificationName == notification.notificationName)
                                                                      emitter.emit('UnRegister',alertInfo);
                                                                }
                                                                return true;
                                                              }
function logEvent(message){
                            if(global.tracelevel == 'debug'||global.notificationtracelevel=='debug'){
                                                            console.log(message);
                                                            }
                            if(global.notificationtracelevel=='debug'){
                                                            fs.appendFile(global.loggingDirectory + '/notificationLog.log', "\r\n" + new Date().toISOString()
                                                                                                              .replace(/T/, ' ')
                                                                                                              .replace(/\..+/, '') + " " + message, function (err) {
                                                              });
                            }
                          }
