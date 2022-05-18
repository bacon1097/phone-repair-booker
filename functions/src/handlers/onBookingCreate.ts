import * as functions from "firebase-functions";
import { createEmailTemplate } from "../util/emailTemplates";
import transport from "../util/emailTransporter";
import { validateBooking } from "../util/validators";

export default async (snap: functions.firestore.QueryDocumentSnapshot) => {
  const data = snap.data();

  const isValid = validateBooking(data);

  if (!isValid) {
    console.error("Booking not valid");
    return;
  }

  const date = data.date.toDate();
  // ! TODO: Is this correct?
  date && date.setHours(date.getHours() + 1);

  await transport.sendMail({
    from: "Phone Repair Booker <brunyeeb@gmail.com>",
    to: "brunyeeb@gmail.com",
    subject: "New Booking!",
    html: createEmailTemplate({
      title: "New Booking Received",
      date: date ? date.toLocaleString("en-GB") : "N/A",
      phone: data.phone || "N/A",
      repairType: data.repairType || "N/A",
      deliveryType: data.deliveryType || "N/A",
      ...(data.deliveryType === "pick-up" && {
        pickUpLocation: Object.values(data.pickUpLocation).join(", "),
      }),
    }),
  });
};
