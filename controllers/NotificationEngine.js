//     newNotification.notificationName
//     newNotification.selectedSearch
//     newNotification.thresholdType
//     newNotification.thresholdCount
//     newNotification.timeValue
//     newNotification.timeFrame
//     newNotification.notificationDescription
//     newNotification.enabled
//     newNotification.notifyEmail


var alertInfos = []; //This is a list of all active notifications on this node.
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
      // console.log("Return from Search with Result");
      // console.log(result);
      // console.log("alert Info");
      // console.log(alertInfo);

      if(result.total >= parseInt(alertInfo.thresholdCount,10)){
        console.log("Threshold Met!")
        var triggerTime = new Date();
        //retrieve the result set.
      }
      else {
        console.log("Threshold not Met!")
      }
      var sendingResult = JSON.stringify(result);
      var name = alertInfo.notificationName;
      var email = alertInfo.notifyEmail;
      var description = alertInfo.notificationDescription;


      console.log("sendingResult");
      console.log(sendingResult);
      console.log(alertInfo.notificationName+ ":: " + alertInfo.notifyEmail+ ":: " + alertInfo.notificationDescription + ":: " +result);
      emailEvent(alertInfo.notificationName,alertInfo.notifyEmail,alertInfo.notificationDescription, result);
      //emailEvent(name,email,description,sendingResult);
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
      //Send the email
      // console.log("Return from Search with Result");
      // console.log(result);
      // console.log("alert Info");
      // console.log(alertInfo);

      if(result.total <= parseInt(alertInfo.thresholdCount,10)){
        console.log("Floor Condition Met!")
        var triggerTime = new Date();
        //retrieve the result set.
      }
      else {
        console.log("Floor Condition not Met!")
      }
    console.log(alertInfo.notificationName+ ":: " + alertInfo.notifyEmail+ ":: " + alertInfo.notificationDescription + ":: " +result)  ;
    emailEvent(alertInfo.notificationName,alertInfo.notifyEmail,alertInfo.notificationDescription, result);
  },function(error){
    console.log('Error in EvaluateSearchInternal');
    console.log(error.message);
  });
});

//CelingEvent
//Max record count hit for a given search based on the timeframe.
emitter.on('CelingEvent', function(alertInfo) {
  //A celing Event has been met.
  console.log("NotificationEngine:Celing Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);

  //  console.log("Event Time: " + eventTime + " Trigger Time: " + triggerTime);
  es.EvaluateSearchInternal(alertInfo.selectedSearch, alertInfo.timeValue + alertInfo.timeFrame)
  .then(function(result){
    //result will have count information that will be evaluated
      //Send the email
      console.log("Return from Search with Result");
      console.log(result);
      console.log("alert Info");
      console.log(alertInfo);

      if(result.total <= parseInt(alertInfo.thresholdCount,10)){
        console.log("Floor Condition Met!")
        //retrieve the result set.
        var triggerTime = new Date();
      }
      else {
        console.log("Floor Condition not Met!")
      }

      console.log(alertInfo.notificationName+ ":: " + alertInfo.notifyEmail+ ":: " + alertInfo.notificationDescription + ":: " +result)  ;
    emailEvent(alertInfo.notificationName,alertInfo.notifyEmail,alertInfo.notificationDescription, JSON.stringify(result));
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
    // console.log(JSON.stringify(alertInfo));

  },alertInfo.interval,alertInfo);
  alertInfo.intervalObject = intervalObject;
  alertInfos.push(alertInfo);
});

//Unregister
//stop the timer and remove the object from the list
emitter.on('UnRegister',function(alertInfo){
  console.log("NotificationEngine:event Listiner Unregistered: " + alertInfo.notificationName);
  //stop the event
   clearInterval(alertInfo.intervalObject);
   //Remove the alert from the collection
   delete alertInfos[alertInfos.indexOf(alertInfo)];
});

//Unref
emitter.on('ClearInterval',function(alertInfo){
  console.log("NotificationEngine:Clear Interval" + alertInfo.notificationName);
  clearInterval(alertInfo.intervalObject);//Stop the interval from happening
});

//emailEvent
//InternalMethod
function emailEvent(name,email,description,result){
  console.log("NotificationEngine:emailEvent");
  emailManager.SendEventMail(name,email,description,sendingResult);
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
