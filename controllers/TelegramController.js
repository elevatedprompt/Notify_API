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
        "## "
         alertInfo.notificationName.toString() + "\n @ " + triggerTime.toISOString()
                                                          .replace(/T/, ' ')
                                                          .replace(/\..+/, '') + "\n" +
           "*Search Name:* %0D%0A" +alertInfo.selectedSearch + "%0D%0A\n" +
           "*Condition:* %0D%0A" + thresholdType + " "+ alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + timeframe + "%0D%0A\n" +
           "*Description:*\n %60%60%60" + alertInfo.notificationDescription + "%60%60%60\n" +
           "*Result Count:* %0D%0A" + result.total + "%0D%0A\n" +
           "*Results:* \n\n%60%60%60" + extractDataFromResults(result,alertInfo,"\n") + "%60%60%60";
//*bold+text*%0D%0A_italic+text_%0D%0A%5Btext%5D%28http%3A%2F%2Fwww.example.com%2F%29%0D%0A%60inline+fixed-width+code%60%0D%0A%60%60%60text%0D%0Apre-formatted+fixed-width+code+block%0D%0A%60%60%60
                logEvent(messagetext);
                  var methodCall ='https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage?chat_id=' +alertInfo.telegramChatId + '&text='+ messagetext;

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
