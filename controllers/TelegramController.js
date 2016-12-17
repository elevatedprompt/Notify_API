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
var eventTime = "";
if(global.tracelevel == 'debug'||global.notificationtracelevel=='debug'){
                                                eventTime = "@ " + triggerTime.toISOString()
                                                                                           .replace(/T/, ' ')
                                                                                           .replace(/\..+/, '');
                                               }
  var messagetext =

         "*" + alertInfo.notificationName.toString() + "*\n " + eventTime + "\n" +
           "*Search Name:* %0D%0A" +alertInfo.selectedSearch + "%0D%0A\n" +
           "*Condition:* %0D%0A" + thresholdType + " "+ alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + timeframe + "%0D%0A\n" +
           "*Description:* %0D%0A" + alertInfo.notificationDescription + "%0D%0A\n" +
           "*Result Count:* %0D%0A" + result.total + "%0D%0A\n" +
           "*Results:* \n\n%60%60%60" + extractDataFromResults(result,alertInfo,"\n") + "%60%60%60";
                logEvent(messagetext);
                  var methodCall ='https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage?parse_mode=Markdown&chat_id=' +alertInfo.telegramChatId + '&text='+ messagetext;

                  unirest.post(methodCall)
                  .headers({'Accept': 'application/json','Content-Type': 'application/json'})
                  .end(function (response) {
                    logEvent(JSON.stringify(response.statusCode));
                    logEvent(methodCall);
                  });
}
//Duplicated in emailcontroller
function extractDataFromResults(data,alertInfo,lineDelimiter){
                                            logEvent("Extract Data Function called");
                                            var tokens = alertInfo.notifyData.replace('{','').replace('}','').split('.');
                                            var dataString = "";
                                            for(var index = 0; index < data.hits.length; index++){
                                            //  logEvent("process hit loop");
                                              var temp = data.hits[index];
                                              for(var tt = 0; tt < tokens.length; tt++){
                                              //  logEvent("Process token loop");
                                                temp = temp[tokens[tt]];
                                              }
                                              dataString = dataString +  " " + temp + lineDelimiter;
                                            }
                                            //logEvent(dataString);
                                            return dataString;
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
