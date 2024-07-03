const path = require("path");
const FCM = require("fcm-node");
const users = require("../../../model/userModel");

const sendPushNotification = async (title, message, id, fcmTokenFromProps) => {
  try {
    const firebaseConfigPath = path.join(
      __dirname,
      "../../../FireBaseConfig.json"
    );
    const firebaseConfig = require(firebaseConfigPath);

    const serverKey = firebaseConfig.SERVER_KEY;

    const fcm = new FCM(serverKey);

    const user = await users.findById(id);

    let fcmTokens = user.fcmToken || [];

    if (fcmTokenFromProps) {
      if (!Array.isArray(fcmTokenFromProps)) {
        fcmTokenFromProps = [fcmTokenFromProps];
      }
      fcmTokens = fcmTokens.concat(fcmTokenFromProps);
    }

    if (fcmTokens.length === 0) {
      console.log("No FCM tokens found.");
      return;
    }
    const pushMessage = {
      registration_ids: fcmTokens,
      data: {
        title: title,
        message: message,
      },
    };
    fcm.send(pushMessage, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!", err);
      } else {
        console.log("Push notification sent.", response);
      }
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

module.exports = sendPushNotification;
