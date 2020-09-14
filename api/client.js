const axios = require("/Users/guywassather/projects/whiskey-finder/node_modules/axios");

const {
  oneSignalUrl,
  oneSignalNotificationPath,
  whiskeyUrl,
} = require("/Users/guywassather/projects/whiskey-finder/constants.js");
const { ONESIGNAL_API_KEY, ONESIGNAL_APP_ID, SUBSCRIBER_IDS, ME } = process.env;

const allRecipients = [...(SUBSCRIBER_IDS.split(',')), ME];

const Request = {
  getBottleList: () => {
    return axios.get(whiskeyUrl);
  },

  sendUpdateMessage: message => {
    Request.sendEmail(message, "Bottle Updates", allRecipients);
  },

  sendLogMessage: message => {
    Request.sendEmail(message, "Log", ME);
  },

  sendEmail: (message, subject, recipientIds) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${ONESIGNAL_API_KEY}`,
    };
    const messageData = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: Array.isArray(recipientIds) ? recipientIds : [recipientIds],
      email_subject: subject,
      email_body: message,
      email_from_address: "bottleupdates@gmail.com",
      email_from_name: "Bottle Updates",
    };

    axios
      .post(`${oneSignalUrl}${oneSignalNotificationPath}`, messageData, { headers })
      .then(resp => console.log("Success: ", resp.data))
      .catch(error => console.log("Error: ", error.response.data.errors));
  },
};

module.exports = Request;
