import * as functions from "firebase-functions";
import onBookingCreateFunc from "./handlers/onBookingCreate";
import emailNotificationFunc from "./callable/emailNotification";
import * as admin from "firebase-admin";

admin.initializeApp();
export const firestore = admin.firestore();

export const onBookingCreate = functions.firestore
  .document("bookings/{id}")
  .onCreate(onBookingCreateFunc);

export const emailNotification = functions.https.onRequest(
  emailNotificationFunc
);
