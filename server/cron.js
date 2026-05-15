import cron from "node-cron";
import sendPushNotification from "./sendNotification";

// DB connection
//const db = require("./db");

// Every day at 8 PM
cron.schedule("07 13 * * *", () => {
  console.log("Cron running");
});


cron.schedule("15 13 * * *", async () => {

  console.log("Running 8 PM booking notification job");

  try {

    // Example query
   // const [rows] = await db.query(`
   //   SELECT 
   //     bookings.id,
   //     bookings.booking_time,
   //     users.fcm_token
   //   FROM bookings
   //   JOIN users ON users.id = bookings.user_id
   //   WHERE DATE(bookings.booking_date) = CURDATE() + INTERVAL 1 DAY
   // `);

  //  for (const row of rows) {

      //if (!row.fcm_token) continue;

     await sendPushNotification();
    //}

    console.log("All notifications sent");

  } catch (error) {

    console.log(error);
  }

});