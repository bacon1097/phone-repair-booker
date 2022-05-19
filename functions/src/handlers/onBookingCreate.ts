import * as functions from "firebase-functions";
import createCalendarEvent from "../util/createCalendarEvent";
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

  // ! TODO: This is only for BST
  const date = data.date?.toDate();

  if (!date) {
    console.error("Booking has no date");
    return;
  }

  const displayDate = new Date(date);
  displayDate.setHours(displayDate.getHours() + 1);

  // Create a new date which is offset by 1 hour
  const endDate = new Date(date);
  endDate.setHours(endDate.getHours() + 1);

  await createCalendarEvent({
    summary: "Phone Repair Booking",
    description:
      `Phone: ${data.phone || "N/A"}\n` +
      `Repair Type: ${data.repairType || "N/A"}\n` +
      `Delivery Type: ${data.deliveryType || "N/A"}` +
      (data.deliveryType === "pick-up"
        ? "\n" + Object.values(data.pickUpLocation).join(", ")
        : ""),
    start: date.toISOString(),
    end: endDate.toISOString(),
  });

  await transport.sendMail({
    from: "Phone Repair Booker <brunyeeb@gmail.com>",
    to: "brunyeeb@gmail.com",
    subject: "New Booking!",
    html: createEmailTemplate({
      title: "New Booking Received",
      date: displayDate.toLocaleString("en-GB"),
      phone: data.phone || "N/A",
      repairType: data.repairType || "N/A",
      deliveryType: data.deliveryType || "N/A",
      ...(data.deliveryType === "pick-up" && {
        pickUpLocation: Object.values(data.pickUpLocation).join(", "),
      }),
    }),
  });
};
