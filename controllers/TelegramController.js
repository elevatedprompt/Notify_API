var http = require('http');
var req = require('request');
var unirest = require('unirest');


module.exports.SendTelegramEvent = function(alertInfo,result,triggerTime){
  logEvent("Telegram method fired");
  var messagetext =
    "#Alert Notification#\n" +
      +"##"  + alertInfo.notificationName + " @ " + triggerTime.toISOString()
                                                          .replace(/T/, ' ')
                                                          .replace(/\..+/, '') + "##" +
          "A conditional search trigger has been met.\n" +
          "Search Name: " +alertInfo.selectedSearch + "\n" +
          "Condition:" +
          alertInfo.thresholdType + " "
          + alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + alertInfo.timeframe + "\n" +
          "" +
                  "Result Count:"
                  + result.total +
                  "\n" +
                  "Description:"
                  + alertInfo.notificationDescription +
                  "";
                //  logEvent('https://api.telegram.org/'+global.telegramAPIKey +'/sendMessage');
                console.log(messagetext);
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
