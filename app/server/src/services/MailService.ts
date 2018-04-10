const nodemailer = require('nodemailer');
var config = require('../config');


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  service: config.mail.service,
  auth: {
    user: config.mail.user, //email
    pass: config.mail.pass // password
  }
});

class MailService {

sendMessage(title, mailOptions): boolean {
  let success = false;

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      success = false;
    } else {
      console.log('%s %s sent: %s',title, info.messageId, info.response);
      success = true;
    }
  });

  return success;
}

}
export = MailService;
