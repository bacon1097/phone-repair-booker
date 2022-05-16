import { Icon } from "@iconify/react";
import { logEvent } from "firebase/analytics";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import Button from "../../components/Button";
import Caption from "../../components/Caption";
import DateTimePicker from "../../components/DateTimePicker";
import ListPicker from "../../components/ListPicker";
import Modal from "../../components/Modal";
import StyledContainer from "../../components/StyledContainer";
import Title from "../../components/Title";
import { analytics, db } from "../../firebase";
import {
  PHONE_MODELS,
  PHONE_PRICING,
  PICK_UP_CHARGE,
  REPAIR_TYPES
} from "../../globals";
import styles from "../../styles/book-repair/index.module.scss";

export interface RepairSelection {
  phone: string;
  repairType: string;
  date: Date;
  deliveryType: "pick-up" | "drop-off";
}

const BookRepair = (): JSX.Element => {
  const router = useRouter();

  // Options provided by the user
  const [selection, setSelection] = useState<Partial<RepairSelection>>({
    phone: "",
    repairType: "",
    date: undefined,
    deliveryType: undefined,
  });

  // The total price displayed
  const [totalPrice, setTotalPrice] = useState(0);

  // The modal to be displayed
  const [modal, setModal] = useState<
    "phone" | "repair-type" | "date" | "delivery-type" | undefined
  >();

  // Error message
  const [error, setError] = useState("");

  // Calculate the price everytime the selection is changed
  useEffect(() => {
    setTotalPrice(calculatePrice(selection));
  }, [selection]);

  // Close the modal
  const closeModal = useCallback(() => {
    setModal(undefined);
  }, []);

  useEffect(() => {
    // Clear the error when the user performs an action
    setError("");
  }, [modal]);

  // Submit the booking
  const bookRepair = useCallback(async () => {
    setError("");

    if (
      !(
        selection.date &&
        selection.deliveryType &&
        selection.phone &&
        selection.repairType
      )
    ) {
      console.warn("Not all options have been selected");
      setError("Please select your options");
      return;
    }

    if (
      !PHONE_PRICING[selection.phone]?.[
        selection.repairType as typeof REPAIR_TYPES[number]
      ]
    ) {
      console.warn("Pricing not set for repair");
      setError("Pricing not set, please contact");
      return;
    }

    let docId = "";

    try {
      const existingDocs = await getDocs(
        query(collection(db, "bookings"), where("date", "==", selection.date))
      );

      if (!existingDocs.empty) {
        setError("Slot taken, select another time");
        return;
      }

      docId = (
        await addDoc(collection(db, "bookings"), {
          date: selection.date,
          deliveryType: selection.deliveryType,
          phone: selection.phone,
          repairType: selection.repairType,
        })
      ).id;

      if (!docId) {
        throw new Error("Could not get document ID");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to book time slot, please try again");
      return;
    }

    const analytic = await analytics;
    // Only log the event if we are in production
    if (analytic && process.env.NODE_ENV === "production") {
      logEvent(analytic, "booking");
    }

    router.push({
      pathname: "success",
      query: {
        id: docId,
      },
    });
    return;
  }, [selection, router]);

  // Modals depending on the option clicked
  const getModal = useCallback((): JSX.Element => {
    switch (modal) {
      case "phone":
        return (
          <Modal className={styles.modal} onClose={closeModal}>
            <Title>1. Phone</Title>
            <ListPicker
              options={PHONE_MODELS.map((model) => ({
                key: model,
                text: model,
                value: model,
              }))}
              className={styles.modalContent}
              onSelection={(phone) => {
                setSelection((cur) => ({ ...cur, phone }));
                closeModal();
              }}
            />
          </Modal>
        );
      case "repair-type":
        return (
          <Modal className={styles.modal} onClose={closeModal}>
            <Title>2. Repair Type</Title>
            <ListPicker
              options={REPAIR_TYPES.map((repairType) => {
                const hasPrice = selection.phone
                  ? typeof PHONE_PRICING[selection.phone]?.[
                      repairType as typeof REPAIR_TYPES[number]
                    ] !== "undefined"
                  : false;

                return {
                  key: repairType,
                  text: repairType + (hasPrice ? "" : " - N/A"),
                  value: repairType,
                  selectable: hasPrice,
                };
              })}
              className={styles.modalContent}
              onSelection={(repairType) => {
                setSelection((cur) => ({ ...cur, repairType }));
                closeModal();
              }}
            />
          </Modal>
        );
      case "date":
        return (
          <Modal className={styles.modal} onClose={closeModal}>
            <Title>3. Date</Title>
            <DateTimePicker
              onSelection={(date) => {
                setSelection((cur) => ({ ...cur, date }));
                closeModal();
              }}
              className={styles.modalContent}
            />
          </Modal>
        );
      case "delivery-type":
        return (
          <Modal className={styles.modal} onClose={closeModal}>
            <Title>4. Delivery Type</Title>
            <div className={styles.deliveryBtnContainer}>
              <Button
                type="default"
                onClick={() => {
                  setSelection((cur) => ({
                    ...cur,
                    deliveryType: "pick-up",
                  }));
                  closeModal();
                }}
              >
                {`Pick-up (+£${PICK_UP_CHARGE})`}
              </Button>
              <Button
                type="default"
                onClick={() => {
                  setSelection((cur) => ({
                    ...cur,
                    deliveryType: "drop-off",
                  }));
                  closeModal();
                }}
              >
                {"Drop-off"}
              </Button>
            </div>
          </Modal>
        );
      default:
        return <></>;
    }
  }, [modal, closeModal, selection]);

  return (
    <>
      {getModal()}
      <motion.div
        animate="pageAnimate"
        variants={{
          pageAnimate: {
            opacity: [0, 1],
            scale: [0.5, 1.05, 1],
            transition: {
              ease: "easeInOut",
              duration: 0.4,
            },
          },
        }}
        className={styles.container}
      >
        <Title>Details</Title>
        <Option
          number={1}
          title="Phone"
          value={selection.phone}
          {...(selection.phone && { check: true })}
          onClick={() => setModal("phone")}
        />
        <Option
          number={2}
          title="Repair Type"
          value={selection.repairType}
          {...(selection.repairType && { check: true })}
          onClick={() => setModal("repair-type")}
        />
        <Option
          number={3}
          title="Date"
          value={selection.date ? formatDate(selection.date) : undefined}
          {...(selection.date && { check: true })}
          onClick={() => setModal("date")}
        />
        <Option
          number={4}
          title="Delivery Type"
          value={selection.deliveryType}
          {...(selection.deliveryType && { check: true })}
          onClick={() => setModal("delivery-type")}
        />
        <span>{`Total: £${totalPrice}`}</span>
        <Caption className={styles.caption}>
          Payment to be taken after satisfactory repair.
        </Caption>
        <Button type="cta" onClick={bookRepair}>
          Book
        </Button>
        {error && <span className={styles.errorMessage}>{error}</span>}
        <Caption className={styles.caption}>
          All repairs will take a minimum of 3 days to complete. If you need
          your repair within the hour, please call{" "}
          <b
            style={{
              color: "#EA5454",
            }}
          >
            <a href="tel:07375090629">07375090629</a>
          </b>
          .
        </Caption>
      </motion.div>
    </>
  );
};

const calculatePrice = (selection: Partial<RepairSelection>) => {
  let runningTotal = 0;

  // Pick up charge
  if (selection.deliveryType === "pick-up") {
    runningTotal += PICK_UP_CHARGE;
  }

  // Phone needs to be present for any further calculations
  const price =
    selection.phone && selection.repairType
      ? PHONE_PRICING[selection.phone]?.[
          selection.repairType as typeof REPAIR_TYPES[number]
        ]
      : undefined;
  if (price) {
    return (runningTotal += price || 0);
  }

  return runningTotal;
};

export const formatDate = (date: Date) => {
  return `${("0" + date.getHours()).slice(-2)}:${(
    "0" + date.getMinutes()
  ).slice(-2)} - ${getOrdinalNum(date.getDate())} ${date.toLocaleString(
    "default",
    {
      month: "long",
    }
  )} ${date.getFullYear()}`;
};

const getOrdinalNum = (n: number) => {
  return (
    n +
    (n > 0
      ? ["th", "st", "nd", "rd"][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
      : "")
  );
};

interface OptionProps
  extends Pick<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  title: string;
  number: number;
  value?: string;
  check?: boolean;
}

// The options that are displayed to the user
const Option = ({
  title,
  number,
  value,
  check,
  onClick = () => {},
}: OptionProps): JSX.Element => {
  return (
    <StyledContainer
      className={styles.optionContainer}
      onClick={onClick}
      pressable
    >
      <div className={styles.optionContent}>
        <OptionTitle number={number} text={title} />
        {value && <span className={styles.optionValue}>{value}</span>}
      </div>
      {check && (
        <Icon icon="bi:check" className={styles.checkIcon} width={45} />
      )}
    </StyledContainer>
  );
};

interface OptionTitleProps {
  number: number;
  text: string;
}

// Simple formatting for the title of each option
const OptionTitle = ({ number, text }: OptionTitleProps): JSX.Element => {
  return <span className={styles.OptionTitle}>{`${number}. ${text}`}</span>;
};

export default BookRepair;
