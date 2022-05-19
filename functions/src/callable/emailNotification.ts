import { firestore } from "..";
import { createEmailTemplate } from "../util/emailTemplates";
import transport from "../util/emailTransporter";
import { validateBooking } from "../util/validators";

export default async (data: any) => {
  const email = data?.email;
  const bookingId = data?.bookingId;

  if (!email) {
    return {
      status: false,
      message: "Please provide email",
    };
  }

  if (
    !email.match(
      // eslint-disable-next-line max-len
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    return {
      status: false,
      message: "Invalid email",
    };
  }

  if (!bookingId) {
    return {
      status: false,
      message: "Please provide a booking ID",
    };
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
    return {
      status: false,
      message: "Booking could not be found",
      error: e,
    };
  }

  const isValid = validateBooking(booking);

  if (!isValid) {
    return {
      status: false,
      message: "Booking is invalid",
    };
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
    return {
      status: false,
      message: "Failed to send email",
      error: e,
    };
  }

  return {
    status: true,
    message: "Email notification sent",
  };
};
