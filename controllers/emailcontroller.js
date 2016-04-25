//email controller:
//used to send emails on notification
//https://github.com/eleith/emailjs
//worth checking
//http://best-web-creation.com/articles/view/id/nodejs-mailing?lang=en
//Message
// configuration aka options =
// {
//     user        // username for logging into smtp
//     password // password for logging into smtp
//     host        // smtp host
//     port        // smtp port (if null a standard port number will be used)
//     ssl     // boolean or object {key, ca, cert} (if true or object, ssl connection will be made)
//     tls     // boolean or object (if true or object, starttls will be initiated)
//     timeout // max number of milliseconds to wait for smtp responses (defaults to 5000)
//     domain  // domain to greet smtp with (defaults to os.hostname)
// authentication // array of preferred authentication methods (ex: email.authentication.PLAIN, email.authentication.XOAUTH2)
// }

//No Tify
//EP.Alert.Test@gmail.com
//pw: TestingEP


var email   = require("emailjs");
var configuration =   {
 user:    "ep.alert.test@gmail.com",
 password:"TestinEP",
 host:    "smtp.gmail.com",
 ssl:     true
};
  var server  = email.server.connect(configuration);

 function sendMessage(email)
{
  console.log('Send Email');

  email =   {
     text:    "Alert Notification",
     from:    "No Tify <EP.Alert.Test@gtmail.com>",
     to:      email,
     subject: "EP testing email Notifications",

  };
  //
    server.send(email,
    function(err, message) { console.log(err || message); });
}



module.exports.SendMail= function(req,res,next)
{
  console.log('Send Email Fired');
  console.log(req.body);
  //Read the contents of the call.

  email =   {
     text:    "this is a test",
     from:    "No Tify <EP.Alert.Test@gmail.com>",
     to:      "colin.goss@gmail.com",
     subject: "some alert"
  };
  server.send(email,
   function(err, message) { console.log(err || message);
     if(err!=null){
       console.log("EmailController:SendEventMailError:" + err);
     }});
  next();
}

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

  var messagetext = "<html><div class='navbar-header'>"+
                 "<a class='navbar-brand' onclick='window.open(&quot;http://elevatedprompt.com&quot;)' href='https://127.0.0.1/#/'><img src='./EPStack Administration Panel_files/EP-logo.jpg' height='30' width='30' alt='Elevated Prompt'> EPSTACK</a>"+
                "<button type='button' class='navbar-toggle collapsed' data-toggle='collapse' data-target='#js-navbar-collapse'>"+
                  "  <span class='sr-only'>Toggle navigation</span>"+

                 "   <span class='icon-bar'></span>"+
                "</button>"+
                "<br>"+
                "<br>"+
                "<br>"+
            "</div></html>";

var messagetext = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>"
+"<html xmlns='http://www.w3.org/1999/xhtml'>"
+"<head>"
+"<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />"
+"<title>Demystifying Email Design</title>"
+"<meta name='viewport' content='width=device-width, initial-scale=1.0'/>"
"<table><tr><td>"
+ alertInfo.notificationName +
                    "\nSelected Search: " +
                    alertInfo.selectedSearch + "\n" +
                    "\nResult Count: " +
                    result.total +
                    "\nTime Frame: " +
                    alertInfo.timeValue + " " + timeframe + "\n" +
+"</head>"
+"</html>";
  // var messagetext = alertInfo.notificationName +
  //                     "\nSelected Search: " +
  //                     alertInfo.selectedSearch + "\n" +
  //                     "\nResult Count: " +
  //                     result.total +
  //                     "\nTime Frame: " +
  //                     alertInfo.timeValue + " " + timeframe + "\n";

  email =   {
     from:    "No Tify <EP.Alert.Test@gtmail.com>",
     to:      alertInfo.notifyEmail,
     subject: "Alert: " + alertInfo.notificationName,
     text: messagetext,
     content: "text/html; charset=UTF-8",
     headers:[{Content/-Type: "text/html; charset=UTF-8"}],
     alternative : true,
     // attachment:
     // [
     //    {data:"<html>i <i>hope</i> this works!</html>", alternative:alertInfo.htmlEmail=='true'},
     //    // {path:"path/to/file.zip", type:"application/zip", name:"alertMesages.csv"}
     // ]
  };
  console.log(email.content);
  console.log('send email');
  server.send(email,
   function(err, message) {
     message.content = "text/html; charset=UTF-8";
     if(err!=null){
       console.log("EmailController:SendEventMailError:" + err);
     }
     console.log(err || message);
     return;
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

  email =   {
     from:    "No Tify <EP.Alert.Test@gtmail.com>",
     to:      alertInfo.notifyEmail,
     subject: "Alert: " + alertInfo.notificationName,
     text: messagetext,
     attachment:
     [
        {data:"<html>i <i>hope</i> this works!</html>", alternative:alertInfo.htmlEmail=='true'},
        // {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
     ]
  };



  console.log('send email');
  server.send(email,
   function(err, message) {
     if(err!=null){
       console.log("EmailController:SendEventMailError:" + err);
     }
     console.log(err || message);
     return;
 });
}
