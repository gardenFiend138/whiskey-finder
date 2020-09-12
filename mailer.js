const nodemailer = require('/Users/guywassather/projects/whiskey-finder/node_modules/nodemailer');

const { url } = require('/Users/guywassather/projects/whiskey-finder/constants.js');

function createMailer() {
  const { AUTH, EMAIL } = process.env;

  return nodemailer.createTransport({
    service: 'gmail',
      auth: {
        user: EMAIL,
        pass: AUTH,
      },
    });
}

function mailer() {
  const { EMAIL, ME, SUBSCRIBER_LIST } = process.env;
  const transporter = createMailer();

  const sendEmail = (content) => {
    let message = content + '\n' + url;

    if (message.length + url.length > 160) {
      const bottleList = message.split('\n');
      message = bottleList.shift();
      message += '\n';
      message += `...and ${bottleList.length} more!`;
      message += '\n';
      message += url;
    }
    transporter.sendMail({
      from: EMAIL,
      to: SUBSCRIBER_LIST,
      subject: 'New bottles found!\n',
      text: message,
    }, (err, response) => {
      console.log('sendMail error: ', err);
      console.log('sendMail response: ', response.response);
    });

    console.log('Message sent');
  };

  const sendLog = logMessage => {
    transporter.sendMail({
      from: EMAIL,
      to: ME,
      subject: 'Log\n',
      text: logMessage,
    }, (err, response) => {
      console.log('sendMail error: ', err);
      console.log('sendMail response: ', response.response);
    });

    console.log('Log Message sent');
  };

  return { sendEmail, sendLog };
}

module.exports = mailer;

