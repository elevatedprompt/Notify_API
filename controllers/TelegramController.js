var http = require('http');
var req = require('request');
var unirest = require('unirest');


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
                  + alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + alertInfo.timeframe + "\n" +
                  "</td></tr>" +
                  "<tr><td><strong>Result Count:</strong></td><td>"
                  + result.total +
                  "</td></tr>" +
                  "<tr><td><strong>Description:</strong></td><td>"
                  + alertInfo.notificationDescription +
                  "</td></tr></table>";
                //  logEvent('https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage');

                  var methodCall ='https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage?text='+ messagetext +'&chat_id=' +global.telegramChatId ;

                  unirest.post(methodCall)
                  .headers({'Accept': 'application/json','Content-Type': 'application/json'})
                //  .field('chat_id',global.telegramChatId)
                //  .field('text','test')
                  //.send({ form: { chat_id : global.telegramChatId,text : 'test'} })
                  //JSON.stringify(notification))
                  .end(function (response) {
                    logEvent(response);
                  });

                  // req.post('https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage',
              		// 	{ form: { chat_id : global.telegramChatId,text : messagetext} },
              		// 	function (error, response, body) {
                  //     logEvent("Sent message to Telegram");
              		// 		if (error) {
              		// 			console.log(body)
              		// 		}
              		// 	}
              		// );
}

function logEvent(message){
                            if(global.tracelevel == 'debug'){
                                                              console.log(message);
                                                              }
                          }
