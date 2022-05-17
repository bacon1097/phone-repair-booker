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

    const isValid = validateBooking(data);

    if (!isValid) {
      console.error("Booking not valid");
      return;
    }

    const date = data.date.toDate();
    date && date.setHours(date.getHours() + 1); // ! TODO: Is this correct?

    await transport.sendMail({
      from: "Ben Brunyee <brunyeeb@gmail.com>",
      to: "brunyeeb@gmail.com",
      subject: "New Booking!",
      html:
        "<div>" +
        "<h1>New booking recieved</h1>" +
        "<p>" +
        `Date: ${date ? date.toLocaleString("en-GB") : "N/A"}` +
        "<br />" +
        `Phone: ${data.phone || "N/A"}` +
        "<br />" +
        `Delivery Type: ${data.deliveryType || "N/A"}` +
        "<br />" +
        `${
          data.deliveryType === "pick-up"
            ? `Pick-up Location: ${Object.values(data.pickUpLocation).join(
                ", "
              )}<br />`
            : ""
        }` +
        "</p>" +
        "</div>",
    });
  });

const validateBooking = (data: any): boolean => {
  if (
    !(
      data?.phone &&
      data.date &&
      typeof data.date.toDate === "function" &&
      data.deliveryType &&
      data.repairType
    )
  ) {
    return false;
  }

  if (data.deliveryType === "pick-up") {
    if (
      !(
        data.pickUpLocation?.address &&
        data.pickUpLocation.postcode &&
        data.pickUpLocation.city
      )
    ) {
      return false;
    }
  }

  return true;
};
