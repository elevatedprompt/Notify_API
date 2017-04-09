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
         "*" + alertInfo.notificationName.toString() + "*\n " +
           "*Search Name:* %0D%0A" +alertInfo.selectedSearch + "%0D%0A\n" +
           "*Condition:* %0D%0A" + thresholdType + " "+ alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + timeframe + "%0D%0A\n" +
           "*Description:* %0D%0A" + alertInfo.notificationDescription + "%0D%0A\n" +
           "*Result Count:* %0D%0A" + result.total + "%0D%0A\n" +
           "*Results:* \n%60%60%60" + extractDataFromResults(result,alertInfo,"\n\n") + "%60%60%60";
                logEvent(messagetext.replace("_","\\_"));
                  var methodCall ='https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage?parse_mode=Markdown&chat_id=' +alertInfo.telegramChatId + '&text='+ messagetext.replace("_","\\_");

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

                                        var fields = alertInfo.notifyData.split(',');
                                        var dataString = "";
                                        for(var index = 0; index < data.hits.length; index++){
                                         for(var ndex = 0; ndex < fields.length;ndex++){
                                            var tokens = fields[ndex].replace('{','').replace('}','').split('.');
                                          var finalTokenName = '';
                                            var temp = data.hits[index];
                                              for(var tt = 0; tt < tokens.length; tt++){
                                                logEvent("Process token loop");

                                                temp = temp[tokens[tt]];
                                                finalTokenName = tokens[tt];
                                              }
                                              console.log(typeof temp);
                                              dataString = dataString + " %60%60%60*" + finalTokenName + "*%60%60%60\n";
                                              if((typeof temp) =='object')
                                              {
                                                dataString = dataString +  " " + JSON.stringify(temp) + lineDelimiter;
                                              }
                                              else
                                                dataString = dataString +  " " + temp + lineDelimiter;
                                            }
                                           }
                                            logEvent(dataString);
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
