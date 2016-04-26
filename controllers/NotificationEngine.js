var alertInfos = [];
var emailManager = require('./emailcontroller');
var es = require('./elasticquery');


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
emitter.on('ThresholdMet', function(alertInfo) {
                                              logEvent("NotificationEngine:Threshold Met fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

                                              es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
                                              .then(function(result){

                                                                      if(result.total > 0){
                                                                        logEvent("Threshold Met!")
                                                                        var triggerTime = new Date();
                                                                        emailEvent(alertInfo, result,triggerTime);
                                                                      }
                                                                      else {
                                                                        logEvent("Threshold not Met!")
                                                                      }
                                                                  },function(error){
                                                                    logEvent('Error in EvaluateSearchInternal');
                                                                    logEvent(error.message);
                                                                  });
                                            });

//FloorEvent
//The rowcount for the search query has dropped below the expected value.
//This function is usefull for validating expected levels
emitter.on('FloorEvent', function(alertInfo) {
                                            logEvent("Floor Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

                                            es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
                                            .then(function(result){
                                                                    if(result.total <= parseInt(alertInfo.thresholdCount,10)){
                                                                      logEvent("Floor Condition Met!")
                                                                      var triggerTime = new Date();
                                                                      emailEvent(alertInfo, result,triggerTime);
                                                                    }
                                                                    else {
                                                                      logEvent("Floor Condition not Met!")
                                                                    }
                                                                },function(error){
                                                                  logEvent('Error in EvaluateSearchInternal');
                                                                  logEvent(error.message);
                                                                });
                                          });

//CelingEvent
//Max record count hit for a given search based on the timeframe.
emitter.on('CelingEvent', function(alertInfo) {
                                              logEvent("NotificationEngine:Celing Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

                                              es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
                                              .then(function(result){
                                                                        if(result.total <= parseInt(alertInfo.thresholdCount,10)){
                                                                          logEvent("Celing Condition Met!")
                                                                          //retrieve the result set.
                                                                          var triggerTime = new Date();
                                                                          emailEvent(alertInfo, result,triggerTime);
                                                                        }
                                                                        else {
                                                                          console.log("Celing Condition not Met!")
                                                                        }
                                                                    },function(error){
                                                                      logEvent('Error in EvaluateSearchInternal');
                                                                      logEvent(error.message);
                                                                    });
                                            });



//Register
//Register and setup interval for monitor
emitter.on('Register',function(alertInfo){
                                          logEvent("NotificationEngine:event Listiner Registered: " + alertInfo.notificationName);
                                          var intervalObject = setInterval(function(alertInfo){
                                                                                                //Emit the threshold type to be evaluated
                                                                                                logEvent("NotificationEngine:Interval Hit:" + alertInfo.notificationName);
                                                                                                emitter.emit(alertInfo.thresholdType,alertInfo);
                                                                                              },alertInfo.checkFreq||60000,alertInfo);
                                          alertInfo.intervalObject = intervalObject;
                                          alertInfos.push(alertInfo);
                                        });

//Unregister
//stop the timer and remove the object from the list
emitter.on('UnRegister',function(alertInfo){
                                              logEvent("NotificationEngine:event Listiner Unregistered: " + alertInfo.notificationName);
                                               clearInterval(alertInfo.intervalObject);
                                               delete alertInfos[alertInfos.indexOf(alertInfo)];
                                            });

//Unref
emitter.on('ClearInterval',function(alertInfo){
                                                logEvent("NotificationEngine:Clear Interval" + alertInfo.notificationName);
                                                clearInterval(alertInfo.intervalObject);//Stop the interval from happening
                                              });

//emailEvent
function emailEvent(alert,result,triggerTime){
                                    logEvent("NotificationEngine:emailEvent");
                                    emailManager.SendEventMail(alert,result,triggerTime);
                                  }

function emailResultEvent(alert,result,valuableResults){
                                                          logEvent("NotificationEngine:emailResultEvent");
                                                          emailManager.SendResultEventMail(alert,result,valuableResults);
                                                        }


//UnregisterEventMonitor
//Internal method.
function UnregisterEventMonitor(alertInfo){
                                            clearInterval(alertInfo.intervalObject);
                                            emitter.emit('Unregister',alertInfo);
                                          }

//RegisterNotification
//emit's an event to register the alertInfo
module.exports.RegisterNotification = function(alertInfo){
                                                          logEvent('NotificationEngine:Register Notification');
                                                          emitter.emit('Register',alertInfo);
                                                        }

//UnregisterNotification
//Unregiser the event.
module.exports.UnregisterNotification = function(notification){
                                                                logEvent('NotificationEngine:Unregister Notification: ' + notification.notificationName);

                                                                if(alertInfos.length>=0)
                                                                  return true;
                                                                forEach(alertInfo in alertInfos)
                                                                {
                                                                  logEvent(alertInfo);
                                                                  if(alertInfo.notificationName == notification.notificationName)
                                                                      emitter.emit('Unregister',alertInfo);
                                                                }
                                                                return true;
                                                              }
function logEvent(message){
                            if(global.tracelevel == 'debug'){
                            console.log(message);
                            }
                          }
