//email controller:
//used to send emails on notification
//https://www.npmjs.com/package/nodemailer

var nodemailer   = require("nodemailer");
var fs = require('fs')
// Create a SMTP transporter object
// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'test.nodemailer@gmail.com',
//         pass: 'Nodemailer123'
//     },
//     logger: true, // log to console
//     debug: true // include SMTP traffic in the logs
// }, {
//     // default message fields
//
//     // sender info
//     from: 'Sender Name <sender@example.com>',
//     headers: {
//         'X-Laziness-level': 1000 // just an example header, no need to use this
//     }
// });

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
                                                service: 'Gmail',
                                                secure: true,
                                                auth: {
                                                    user: global.emailConfiguration.user,
                                                    pass: global.emailConfiguration.password
                                                }
                                            });


//SendEventMail
//This will send an email to the recipent that a trigegr has happened
module.exports.SendEventMail = function(alertInfo,result,triggerTime){
                                                          logEvent('Email Controller=>Send Event Email Fired');
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
                                                                        thresholdType + " "
                                                                        + alertInfo.thresholdCount + " in " + alertInfo.timeValue + " " + timeframe + "\n" +
                                                                        "</td></tr>" +
                                                                        "<tr><td><strong>Result Count:</strong></td><td>"
                                                                        + result.total +
                                                                        JSON.stringify(result) +
                                                                        "</td></tr>" +
                                                                        "<tr><td><strong>Description:</strong></td><td>"
                                                                        + alertInfo.notificationDescription +
                                                                        "</td></tr></table>";

                                                            logEvent('incoming data');
                                                            logEvent(JSON.stringify(result));
                                                            logEvent(JSON.stringify(result.hits));
                                                            logEvent('Split notifyData');

                                                            //logEvent(alertInfo.notifyData.replace('{','').replace('}','').split('.'));
                                                            var tokens = alertInfo.notifyData.replace('{','').replace('}','').split('.');
                                                            //logEvent("tokens" + tokens);
                                                            //logEvent("tokens" + JSON.stringify(tokens));

                                                            logEvent("pre loop");
                                                            //for(hit in result.hits)
                                                            for(; index < result.hits.length; index++){
                                                              logEvent('Parse results');
                                                              logEvent(JSON.stringify(tokens));
                                                              var temp = result.hits[index];
                                                              //for(token in tokens){
                                                              for(; tt < tokens.length; tt++){
                                                                logEvent("data: " + JSON.stringify(temp));
                                                                logEvent("hit :" + JSON.stringify(result.hits[index]));
                                                                temp = temp[tokens[tt]];
                                                                logEvent("Walk out the tokens");
                                                                logEvent("token: " + JSON.stringify(tokens[tt]));
                                                                logEvent("value: " + JSON.stringify(temp));
                                                              }
                                                              logEvent(JSON.stringify(temp));
                                                            }

                                                            logEvent(alertInfo.notifyData.replace('{','').replace('}').split('.'))

                                                            var mailOptions = {
                                                              from: global.emailConfiguration.fromSender,
                                                              to: alertInfo.notifyEmail,
                                                              subject: "Alert: " + alertInfo.notificationName,
                                                              text: "Alert: " + alertInfo.notificationName,
                                                              html: messagetext
                                                          };

                                                          // send mail with defined transport object
                                                          transporter.sendMail(mailOptions, function (error, info) {
                                                                                                                      if (error) {
                                                                                                                          logEvent('Send Email Error:' + error);
                                                                                                                      } else {
                                                                                                                          logEvent('Message sent: ' + info.response);
                                                                                                                      }
                                                                                                                  });

                                                        }

//SendResultEventMail
//Will send an email to the recipient that an event has happened with the data attached.
module.exports.SendResultEventMail = function(alertInfo,result,valuableResults){
                                                                                logEvent('Email Controller=>Send Event Email Fired');
                                                                                var timeframe = ""
                                                                                switch(alertInfo.timeFrame) {
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

                                                                                var messagetext = "\nNotification Name: " +
                                                                                                    alertInfo.notificationName +
                                                                                                    "\nSelected Search: " +
                                                                                                    alertInfo.selectedSearch + "\n" +
                                                                                                    "\nResult Count: " +
                                                                                                    result.total +
                                                                                                    "\nTime Frame: " +
                                                                                                    alertInfo.timeValue + " " +timeframe;

                                                                                  if(alertInfo.htmlEmail=='true'){
                                                                                                                    messagetext + "\nData: " +
                                                                                                                    JSON.stringify(valuableResults);
                                                                                                                  }


                                                                                  var mailOptions = {
                                                                                                        from: global.emailConfiguration.fromSender,
                                                                                                        to: alertInfo.notifyEmail,
                                                                                                        subject: "Alert: " + alertInfo.notificationName,
                                                                                                        text: "Alert: " + alertInfo.notificationName,
                                                                                                        html: messagetext
                                                                                                    };

                                                                                logEvent('send email');
                                                                                transporter.sendMail(mailOptions, function (error, info) {
                                                                                                                                            if (error) {
                                                                                                                                                logEvent(error);
                                                                                                                                            } else {
                                                                                                                                                logEvent('Message sent: ' + info.response);
                                                                                                                                            }
                                                                                                                                        });
                                                                              }

function logEvent(message){
                            if(global.tracelevel == 'debug'||global.notificationtracelevel=='debug'){
                              console.log(message);
                            }
                            if(global.notificationtracelevel=='debug'){
                                                            fs.appendFile(global.loggingDirectory + '/notificationLog.log', "\r\n" + new Date().toISOString()
                                                                                                              .replace(/T/, ' ')
                                                                                                              .replace(/\..+/, '')+ " EmailCtrl " + message, function (err) {
                                                              });
                            }
                          }
