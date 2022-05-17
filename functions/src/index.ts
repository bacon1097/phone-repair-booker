import * as functions from "firebase-functions";
import { createTransport } from "nodemailer";

const transport = createTransport({
  service: "gmail",
  auth: {
    user: "brunyeeb@gmail.com",
    pass: "wvwksccppjnumtgl",
  },
});

export const onBookingCreate = functions.firestore
  .document("bookings/{id}")
  .onCreate(async (snap) => {
    const data = snap.data();

    const date = data.date.toDate();
    date.setHours(date.getHours() + 1); // ! TODO: Is this correct?

    await transport.sendMail({
      from: "Ben Brunyee <brunyeeb@gmail.com>",
      to: "brunyeeb@gmail.com",
      subject: "New Booking!",
      html: `<div><h1>New booking recieved:</h1><p>Date: ${date.toLocaleString(
        "en-GB"
      )}<br />Phone: ${data.phone}<br />Delivery Type: ${
        data.deliveryType
      }<br />${
        data.deliveryType === "pick-up"
          // ! TODO: Better formatting
          ? `Pick-up Location: ${Object.values(data.pickUpLocation).map(
            (v) => `${v}, `
          )}`
          : ""
      }</p>
    </div>`,
    });
  });
