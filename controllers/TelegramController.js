var http = require('http');
var req = require('request');


module.exports.SendTelegramEvent = function(alertInfo,result,triggerTime){
  logEvent("Telegram method fired");
  var messagetext =
                  "<table><tr><td colspan='2'><strong>A conditional search trigger has been met.</strong></td></tr><tr><td colspan='2'>&nbsp;</td></tr>"+
                  "<tr><td><strong>Notification Name:</strong></td><td>"
                  + alertInfo.notificationName + " @ " + triggerTime.toISOString()
                                                                    .replace(/T/, ' ')
                                                                    .replace(/\..+/, '') +
                  "</td></tr>" +
                  "<tr><td><strong>Search Name:</strong></td><td>"
                  + alertInfo.selectedSearch +
                  "</td></tr>" +
                  "<tr><td><strong>Condition:</strong></td><td>" +
                  alertInfo.thresholdType + " "
                  + alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + timeframe + "\n" +
                  "</td></tr>" +
                  "<tr><td><strong>Result Count:</strong></td><td>"
                  + result.total +
                  "</td></tr>" +
                  "<tr><td><strong>Description:</strong></td><td>"
                  + alertInfo.notificationDescription +
                  "</td></tr></table>";
                  logEvent('https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage');
                  req.post('https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage',
              			{ form: { chat_id : global.telegramChatId,text : messagetext} },
              			function (error, response, body) {
                      logEvent("Sent message to Telegram");
              				if (error) {
              					console.log(body)
              				}
              			}
              		);
}

function logEvent(message){
                            if(global.tracelevel == 'debug'){
                                                              console.log(message);
                                                              }
                          }
