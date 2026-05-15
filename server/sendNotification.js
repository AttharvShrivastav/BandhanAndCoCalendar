import admin from "./firebaseAdmin.js";


const sendPushNotification = async (payload) => {
  try {
    if (!payload?.token) {
      console.log("❌ No token, skipping notification");
      return;
    }

    const message = {
      token: payload.token,

      notification: {
        title: `Upcoming ${payload.eventType}`,
        body: `${payload.eventType} on ${payload.eventDate}${
          payload.venueName ? ` at ${payload.venueName}` : ""
        }`,
      },
    };

    const response = await admin.messaging().send(message);

    console.log("SUCCESS:", response);
  } catch (error) {
    console.log("FCM ERROR:", error.message);
  }
};

export default sendPushNotification;