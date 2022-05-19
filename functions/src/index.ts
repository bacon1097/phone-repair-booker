import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import emailNotificationFunc from "./callable/emailNotification";
import onBookingCreateFunc from "./handlers/onBookingCreate";

admin.initializeApp();
export const firestore = admin.firestore();

export const onBookingCreate = functions.firestore
  .document("bookings/{id}")
  .onCreate(onBookingCreateFunc);

export const emailNotification = functions.https.onCall(emailNotificationFunc);
