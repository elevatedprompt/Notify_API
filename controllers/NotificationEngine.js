
var alertInfos = []; //This is a list of all active notifications on this node.


//     newNotification.notificationName
//     newNotification.selectedSearch
//     newNotification.thresholdType
//     newNotification.thresholdCount
//     newNotification.timeValue
//     newNotification.timeFrame
//     newNotification.notificationDescription
//     newNotification.enabled
//     newNotification.notifyEmail

var emailManager = require('./emailcontroller');

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

//Event Implementation

var emitter = new EP_EventEmitter();
emitter.on('ThresholdMet', function(alertInfo) {
  //An threshold has been met
  //queryName,eventTime,triggerTime,
  console.log("Threshold Met fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);
  //console.log("Event Time: " + eventTime + " Trigger Time: " + triggerTime);
  emailEvent(alertInfo);
  //Collect the data
  //Send the email

});
emitter.on('FloorEvent', function(alertInfo) {
  //An Floor Event has been met
  //queryName,eventTime,triggerTime,
  console.log("Floor Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);
  //console.log("Event Time: " + eventTime + " Trigger Time: " + triggerTime);
  emailEvent(alertInfo);
  //Collect the data
  //Send the email

});
emitter.on('CelingEvent', function(alertInfo) {
  //A celing Event has been met.
  console.log("Celing Event fired - Query:" + alertInfo.selectedSearch + " Alert Name: " + alertInfo.notificationName);
//  console.log("Event Time: " + eventTime + " Trigger Time: " + triggerTime);
  emailEvent(alertInfo);
  //Collect the data
  //Send the email
});

emitter.on('Register',function(alertInfo){
  console.log("event Listiner Registered: " + alertInfo.notificationName);
  var intervalObject = setInterval(function(alertInfo){
    //This is where the magic happens
    emitter.emit(alertInfo.thresholdType,alertInfo);

    console.log("inside interval");
    console.log(JSON.stringify(alertInfo));
    console.log('checked ' + alertInfo.notificationName);

  },alertInfo.interval,alertInfo);
  alertInfo.intervalObject = intervalObject;
  alertInfos.push(alertInfo);
});

emitter.on('UnRegister',function(alertInfo){
  console.log("event Listiner Unregistered: " + alertInfo.notificationName);
  //stop the event
   clearInterval(alertInfo.intervalObject);
   //Remove the alert from the collection
   delete alertInfos[alertInfos.indexOf(alertInfo)];
});
//Unref
emitter.on('ClearInterval',function(alertInfo){
  ClearInterval(alertInfo.intervalObject);//Stop the interval from happening
});

function emailEvent(alertInfo){
  emailManager.SendMail();
}

module.exports.RegisterNotification = function(alertInfo){
  console.log('Register Notification');
  emitter.emit('Register',alertInfo);
}

function UnregisterEventMonitor(alertInfo){
  clearInterval(alertInfo.intervalObject);
  emitter.emit('Unregister',alertInfo);
}


//Unregiser the event.
module.exports.UnregisterNotification = function(notification)
{
  console.log('Unregister Notification: ' + notification.notificationName);

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
