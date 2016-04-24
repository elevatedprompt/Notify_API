//     newNotification.notificationName
//     newNotification.selectedSearch
//     newNotification.thresholdType
//     newNotification.thresholdCount
//     newNotification.timeValue
//     newNotification.timeFrame
//     newNotification.notificationDescription
//     newNotification.enabled
//     newNotification.notifyEmail


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

  //queryName,eventTime,triggerTime,
  console.log("NotificationEngine:Threshold Met fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

  es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
  .then(function(result){
    //result will have count information that will be evaluated
      //Send the email

      if(result.total >= parseInt(alertInfo.thresholdCount,10)){
        console.log("Threshold Met!")
        //retrieve the result set.
        var triggerTime = new Date();
        emailEvent(alertInfo, result);
        if(false){
          es.GetSearchResult(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame,result.total)
          .then(function(valuableResults){
            console.log("Inside internalQuery");
              emailResultEvent(alertInfo, result,valuableResults);
          },function(error){
            console.log('Error in EvaluateSearchInternalWResults');
            console.log(error.message);
          });}
      }
      else {
        console.log("Threshold not Met!")
      }
    //  emailEvent(alertInfo, result);
  },function(error){
    console.log('Error in EvaluateSearchInternal');
    console.log(error.message);
  });
});

//FloorEvent
//The rowcount for the search query has dropped below the expected value.
//This function is usefull for validating expected levels
emitter.on('FloorEvent', function(alertInfo) {
  //An Floor Event has been met
  //queryName,eventTime,triggerTime,
  console.log("Floor Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);
  //console.log("Event Time: " + eventTime + " Trigger Time: " + triggerTime);

  es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
  .then(function(result){
    //result will have count information that will be evaluated

      if(result.total <= parseInt(alertInfo.thresholdCount,10)){
        console.log("Floor Condition Met!")
        var triggerTime = new Date();
        emailEvent(alertInfo, result);
        if(false){
          es.GetSearchResult(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame,result.total)
          .then(function(valuableResults){
              emailResultEvent(alertInfo, result,valuableResults);
          },function(error){
            console.log('Error in EvaluateSearchInternalWResults');
            console.log(error.message);
          });
        }
      }
      else {
        console.log("Floor Condition not Met!")
      }
  },function(error){
    console.log('Error in EvaluateSearchInternal');
    console.log(error.message);
  });
});

//CelingEvent
//Max record count hit for a given search based on the timeframe.
emitter.on('CelingEvent', function(alertInfo) {
  console.log("NotificationEngine:Celing Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

  //  console.log("Event Time: " + eventTime + " Trigger Time: " + triggerTime);
  es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
  .then(function(result){
      if(result.total <= parseInt(alertInfo.thresholdCount,10)){
        console.log("Celing Condition Met!")
        //retrieve the result set.
        var triggerTime = new Date();
        emailEvent(alertInfo, result);
        if(false){
          es.GetSearchResult(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame,result.total)
          .then(function(valuableResults){
              emailResultEvent(alertInfo, result,valuableResults);
          },function(error){
            console.log('Error in EvaluateSearchInternalWResults');
            console.log(error.message);
          });
        }
      }
      else {
        console.log("Celing Condition not Met!")
      }
  },function(error){
    console.log('Error in EvaluateSearchInternal');
    console.log(error.message);
  });
});



//Register
//Register and setup interval for monitor
emitter.on('Register',function(alertInfo){
  console.log("NotificationEngine:event Listiner Registered: " + alertInfo.notificationName);
  var intervalObject = setInterval(function(alertInfo){
    //Emit the threshold type to be evaluated
    console.log("NotificationEngine:Interval Hit:" + alertInfo.notificationName);
    emitter.emit(alertInfo.thresholdType,alertInfo);
  },alertInfo.checkFreq||60000,alertInfo);
  alertInfo.intervalObject = intervalObject;
  alertInfos.push(alertInfo);
});

//Unregister
//stop the timer and remove the object from the list
emitter.on('UnRegister',function(alertInfo){
  console.log("NotificationEngine:event Listiner Unregistered: " + alertInfo.notificationName);
   clearInterval(alertInfo.intervalObject);
   delete alertInfos[alertInfos.indexOf(alertInfo)];
});

//Unref
emitter.on('ClearInterval',function(alertInfo){
  console.log("NotificationEngine:Clear Interval" + alertInfo.notificationName);
  clearInterval(alertInfo.intervalObject);//Stop the interval from happening
});

//emailEvent
function emailEvent(alert,result){
  console.log("NotificationEngine:emailEvent");
  emailManager.SendEventMail(alert,result);
}

function emailResultEvent(alert,result,valuableResults){
  console.log("NotificationEngine:emailResultEvent");
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
  console.log('NotificationEngine:Register Notification');
  emitter.emit('Register',alertInfo);
}

//UnregisterNotification
//Unregiser the event.
module.exports.UnregisterNotification = function(notification)
{
  console.log('NotificationEngine:Unregister Notification: ' + notification.notificationName);

  if(alertInfos.length>=0)
    return true;
  forEach(alertInfo in alertInfos)
  {
    console.log(alertInfo);
    if(alertInfo.notificationName == notification.notificationName)
        emitter.emit('Unregister',alertInfo);
  }
  return true;
}
