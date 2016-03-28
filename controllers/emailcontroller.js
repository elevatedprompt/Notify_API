//email controller:
//used to send emails on notification


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

     subject: "EP testing email Notifications"
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
     from:    "No Tify <EP.Alert.Test@gtmail.com>",
     to:      "colin.goss@gmail.com",
     subject: "some alert"
  };
  server.send(email,
   function(err, message) { console.log(err || message); });
  next();
}



module.exports.testEmail= function(email,next)
{
  console.log('Test Email Fired');

  email =   {
     text:    "Alert Notification",
     from:    "No Tify <EP.Alert.Test@gtmail.com>",
     to:      "someone <colin.goss@gmail.com>",

     subject: "EP testing email Notifications"
  };

    server.send(email,
     function(err, message) { console.log(err || message); });
     next();
}
