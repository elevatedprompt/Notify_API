var http = require('http');
var req = require('request');


module.exports.SendTelegramEvent = function(alertInfo,result,triggerTime){

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

                  req.post('https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage',
              			{ form: { chat_id : global.telegramChatId,text : messagetext} },
              			function (error, response, body) {
              				if (error) {
              					console.log(body)
              				}
              			}
              		);
}
