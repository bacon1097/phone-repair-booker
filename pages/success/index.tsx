import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import Caption from "../../components/Caption";
import Input from "../../components/Input";
import Title from "../../components/Title";
import { db, functions } from "../../firebase";
import styles from "../../styles/success/index.module.scss";
import { formatDate, RepairSelection } from "../book-repair";

const Success = (): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;
  // ! TODO: Implement
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<RepairSelection>();
  const firstLoad = useRef(true);
  const [email, setEmail] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const sendNotification = useCallback(async () => {
    setIsSending(true);
    try {
      await httpsCallable(
        functions,
        "emailNotification"
      )({
        email,
        bookingId: id,
      });
      setNotificationSent(true);
    } catch (e) {
      console.error(e);
      setError("Failed to send email");
    }
    setIsSending(false);
  }, [email, id]);

  useEffect(() => {
    const onLoad = async () => {
      firstLoad.current = false;

      if (!id) {
        console.error("No booking ID found");
        router.push("/");
        return;
      }

      if (Array.isArray(id)) {
        console.error("Multiple IDs found");
        router.push("/");
        return;
      }

      try {
        const res = await getDoc(doc(db, "bookings", id));
        const data = res.data();

        if (
          !(
            data &&
            data.date &&
            data.deliveryType &&
            data.phone &&
            data.repairType
          )
        ) {
          throw new Error("Not all data is present");
        }

        setBooking({
          date: data.date.toDate(),
          deliveryType: data.deliveryType,
          phone: data.phone,
          repairType: data.repairType,
          pickUpLocation: data.pickUpLocation,
        });
      } catch (e) {
        console.error(e);
        setError("Failed to load booking information");
        return;
      }
    };

    if (firstLoad.current) {
      onLoad();
    }
  }, [id, router]);

  if (!booking) {
    return (
      <div className={styles.container}>
        <Title>Loading...</Title>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div>
        <Title className={styles.smallTitle}>Nice!</Title>
        <Title>{"You're Booked In!"}</Title>
      </div>
      <Caption>
        {`You've booked for a ${booking.repairType} repair for an ${
          booking.phone
        } at ${formatDate(booking.date)}.`}
      </Caption>
      <div className={styles.emailNotification}>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="cta"
          onClick={sendNotification}
          disabled={isSending || notificationSent}
        >
          Send
        </Button>
      </div>
      {notificationSent && <Caption>Notification sent</Caption>}
      {booking.deliveryType === "drop-off" && (
        <Caption>
          <b>Drop-off location:</b>
          <br />
          100 Howeth Road,
          <br />
          Bournemouth,
          <br />
          BH10 5ED,
          <br />
          United Kingdom
        </Caption>
      )}
      {/* <Button type="cta" onClick={addReminder} className={styles.reminderBtn}>
        Add Reminder
      </Button> */}
    </div>
  );
};

export default Success;
