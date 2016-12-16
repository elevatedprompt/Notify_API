var http = require('http');
var req = require('request');
var unirest = require('unirest');
var fs = require('fs')

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
                                    case "Max":
                                    thresholdType = "Less Than";
                                    break;
                                    case "Min":
                                    thresholdType = "More Than";
                                    break;
                                    case "Any":
                                    thresholdType = "Any";
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
                  var validateCall = 'https://api.telegram.org/' + global.telegramAPIKey + '/getMe';
                  if(global.notificationtracelevel=='debug'){
                  unirest.post(validateCall)
                  .headers({'Accept': 'application/json','Content-Type': 'application/json'})
                  .end(function (response) {
                    logEvent(JSON.stringify(response));
                    logEvent(methodCall);
                  });
                }

                  unirest.post(methodCall)
                  .headers({'Accept': 'application/json','Content-Type': 'application/json'})
                  .end(function (response) {
                    logEvent(JSON.stringify(response.statusCode));
                    logEvent(methodCall);
                  });
}

function logEvent(message){
                            if(global.tracelevel == 'debug'||global.notificationtracelevel=='debug'){
                                                              console.log(message);
                                                              }
                            if(global.notificationtracelevel=='debug'){
                                                            fs.appendFile(global.loggingDirectory + '/notificationLog.log', "\r\n" +new Date().toISOString()
                                                                                                              .replace(/T/, ' ')
                                                                                                              .replace(/\..+/, '') +" TelegramCtrl " + message, function (err) {
                                                              });
                            }
                          }
