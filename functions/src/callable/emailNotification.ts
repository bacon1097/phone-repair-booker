import * as functions from "firebase-functions";
import { firestore } from "..";
import { createEmailTemplate } from "../util/emailTemplates";
import transport from "../util/emailTransporter";
import { validateBooking } from "../util/validators";

export default async (
  req: functions.https.Request,
  res: functions.Response<any>
) => {
  const email = req.body.data.email;
  const bookingId = req.body.data.bookingId;

  console.log(req.body);

  if (!email) {
    res.status(400).send({
      status: false,
      message: "Please provide email",
    });
    return;
  }

  if (!bookingId) {
    res.status(400).send({
      status: false,
      message: "Please provide a booking ID",
    });
    return;
  }

  let booking: any;

  try {
    const doc = await firestore.doc(`bookings/${bookingId}`).get();
    const data = doc.data();

    if (!(doc.exists && data)) {
      throw new Error(`Could not find booking document for ID: ${bookingId}`);
    }

    booking = data;
  } catch (e) {
    console.error(e);
    res.status(500).send({
      status: false,
      message: "Booking could not be found",
      error: e,
    });
    return;
  }

  const isValid = validateBooking(booking);

  if (!isValid) {
    res.status(500).send({
      status: false,
      message: "Booking is invalid",
    });
    return;
  }

  const date = booking.date.toDate();
  // ! TODO: Is this correct?
  date && date.setHours(date.getHours() + 1);

  try {
    await transport.sendMail({
      from: "Phone Repair Booker <brunyeeb@gmail.com>",
      to: email,
      subject: "Booking Confirmation",
      html: createEmailTemplate({
        title: "Phone Repair Booking Confirmation",
        date: date ? date.toLocaleString("en-GB") : "N/A",
        phone: booking.phone || "N/A",
        repairType: booking.repairType || "N/A",
        deliveryType: booking.deliveryType || "N/A",
        ...(booking.deliveryType === "pick-up" && {
          pickUpLocation: Object.values(booking.pickUpLocation).join(", "),
        }),
        ...(booking.deliveryType === "drop-off" && {
          notes: "Drop-off Location: 100 Howeth Road, BH10 5ED, Bournemouth",
        }),
      }),
    });

    await firestore.doc(`bookings/${bookingId}`).update({
      email,
    });
  } catch (e) {
    res.status(500).send({
      status: false,
      message: "Failed to send email",
      error: e,
    });
    return;
  }

  res.status(200).send({
    status: true,
    message: "Email notification sent",
  });
  return;
};
