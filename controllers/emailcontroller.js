//email controller:
//used to send emails on notification
//https://www.npmjs.com/package/nodemailer

var nodemailer   = require("nodemailer");

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
    auth: {
        user: 'ep.alert.test@gmail.com',
        pass: 'TestinEP'
    }
});

var configuration =   {
 user:    "ep.alert.test@gmail.com",
 password:"TestinEP",
 host:    "smtp.gmail.com",
 ssl:     true
};
var fromSender = "No Tify <EP.Alert.Test@gtmail.com>";
var server  = email.server.connect(configuration);

//SendEventMail
//This will send an email to the recipent that a trigegr has happened
module.exports.SendEventMail = function(alertInfo,result)
{
  console.log('Email Controller:Send Event Email Fired');
  var timeframe = ""
  switch(alertInfo.timeFrame)
  {
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
    case "CelingEvent":
    thresholdType = "More Than";
    break;
    case "ThresholdMet":
    thresholdType = "More Than";
    break;
  }


var messagetext =

                "<table><tr><td colspan='2'>A conditional search trigger has been met.</td>"+
                "<tr><td><strong>Notification Name:</strong></td><td>"
                + alertInfo.notificationName +
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
                "</td></tr>" +
                "<tr><td><strong>Description:</strong></td><td>"
                + alertInfo.notificationDescription +
                "</td></tr></table>";


    var mailOptions = {
      from: fromSender,
      to: alertInfo.notifyEmail,
      subject: "Alert: " + alertInfo.notificationName,
      text: "Alert: " + alertInfo.notificationName,
      html: messagetext
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
      } else {
          console.log('Message sent: ' + info.response);
      }
  });

}

//SendResultEventMail
//Will send an email to the recipient that an event has happened with the data attached.
module.exports.SendResultEventMail = function(alertInfo,result,valuableResults)
{
  console.log('Email Controller:Send Event Email Fired');
  var timeframe = ""
  switch(alertInfo.timeFrame)
  {
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

    if(alertInfo.htmlEmail=='true')
    {
      messagetext + "\nData: " +
      JSON.stringify(valuableResults);
    }


    var mailOptions = {
      from: fromSender,
      to: alertInfo.notifyEmail,
      subject: "Alert: " + alertInfo.notificationName,
      text: "Alert: " + alertInfo.notificationName,
      html: messagetext
  };

  console.log('send email');
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
      } else {
          console.log('Message sent: ' + info.response);
      }
  });
}
