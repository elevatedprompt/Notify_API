var http = require('http');
var req = require('request');
var unirest = require('unirest');


module.exports.SendTelegramEvent = function(alertInfo,result,triggerTime){
  logEvent("Telegram method fired");
  var timeframe = ""
  switch(alertInfo.timeFrame){
                              case "m":
                              timeframe = "Minutes";
                              break;
                              case "h":
                              timeframe = "Hours";
                              break;
                              case "d":
                              timeframe = "Days";
                              break;
                            }

  var thresholdType = "";
  switch(alertInfo.thresholdType){
                                    case "FloorEvent":
                                    thresholdType = "Less Than";
                                    break;
                                    case "CeilingEvent":
                                    thresholdType = "More Than";
                                    break;
                                    case "ThresholdMet":
                                    thresholdType = "More Than";
                                    break;
                                  }
  var messagetext =

         alertInfo.notificationName.toString() + " @ " + triggerTime.toISOString()
                                                          .replace(/T/, ' ')
                                                          .replace(/\..+/, '') + "\n" +
           "Search Name: " +alertInfo.selectedSearch + "\n" +
           "Condition: " + thresholdType + " "+ alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + timeframe + "\n" +
           "Result Count: " + result.total + "\n" +
           "Description:\n " + alertInfo.notificationDescription;

                logEvent(messagetext);
                  var methodCall ='https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage?chat_id=' +global.telegramChatId + '&text='+ messagetext;

                  unirest.post(methodCall)
                  .headers({'Accept': 'application/json','Content-Type': 'application/json'})
                  .end(function (response) {
                    logEvent(response);
                  });
}

function logEvent(message){
                            if(global.tracelevel == 'debug'){
                                                              console.log(message);
                                                              }
                          }
