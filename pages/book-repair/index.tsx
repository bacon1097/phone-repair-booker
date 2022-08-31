import { Icon } from "@iconify/react";
import clsx from "clsx";
import { logEvent } from "firebase/analytics";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import AddressForm, { Address } from "../../components/AddressForm";
import Button from "../../components/Button";
import Caption from "../../components/Caption";
import DateTimePicker from "../../components/DateTimePicker";
import ListPicker from "../../components/ListPicker";
import Modal from "../../components/Modal";
import StyledContainer from "../../components/StyledContainer";
import Title from "../../components/Title";
import { analytics, db } from "../../firebase";
import {
  MAX_PICK_UP_DISTANCE_KM,
  PHONE_MODELS,
  PHONE_PRICING,
  PICK_UP_CHARGE,
  REPAIR_TYPES
} from "../../globals";
import styles from "../../styles/book-repair/index.module.scss";

interface RepairSelectionBase {
  phone: string;
  repairType: string;
  date: Date;
  phoneScreenColor?: "white" | "black";
}

export interface RepairSelectionDropOff extends RepairSelectionBase {
  deliveryType: "drop-off";
}

export interface RepairSelectionPickUp extends RepairSelectionBase {
  deliveryType: "pick-up";
  pickUpLocation: Address;
}

export type RepairSelection = RepairSelectionDropOff | RepairSelectionPickUp;

const BookRepair = (): JSX.Element => {
  const router = useRouter();

  // Options provided by the user
  const [selection, setSelection] = useState<Partial<RepairSelection>>({
    phone: "",
    repairType: "",
    date: undefined,
    deliveryType: undefined,
    pickUpLocation: undefined,
    phoneScreenColor: undefined,
  });

  // The total price displayed
  const [totalPrice, setTotalPrice] = useState(0);

  // The modal to be displayed
  const [modal, setModal] = useState<
    | "phone"
    | "repair-type"
    | "date"
    | "delivery-type"
    | "pick-up-location"
    | "phone-screen-color"
    | undefined
  >();

  const [locationRequest, setLocationRequest] = useState(false);
  const [locationRequestModal, setLocationRequestModal] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // Can be delivered
  const [deliveryCheck, setCanDeliver] = useState({
    can: false,
    message: "Enable location",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close the modal
  const closeModal = useCallback(() => {
    setModal(undefined);
  }, []);

  // Submit the booking
  const bookRepair = useCallback(async () => {
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

    if (selection.deliveryType === "pick-up" && !selection.pickUpLocation) {
      console.warn("No pick-up address set");
      setError("Please enter pick-up address");
      return;
    }

    if (selection.repairType === "screen" && !selection.phoneScreenColor) {
      console.warn("No phone screen color set");
      setError("Please select your phone's screen color");
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
          price: totalPrice,
          date: selection.date,
          deliveryType: selection.deliveryType,
          phone: selection.phone,
          repairType: selection.repairType,
          ...(selection.repairType === "screen" && {
            phoneScreenColor: selection.phoneScreenColor,
          }),
          ...(selection.deliveryType === "pick-up" && {
            pickUpLocation: selection.pickUpLocation,
          }),
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
  }, [selection, router, totalPrice]);

  const bookRepairWrapper = useCallback(() => {
    setError("");
    bookRepair().finally(() => {
      setIsSubmitting(false);
    });
  }, [bookRepair]);

  // Modals depending on the option clicked
  const getModal = useCallback((): JSX.Element => {
    switch (modal) {
      case "phone":
        return (
          <PhoneModal
            onClose={closeModal}
            onSelection={(phone) => {
              setSelection((cur) => ({ ...cur, phone, repairType: "" }));
              closeModal();
            }}
          />
        );
      case "repair-type":
        return (
          <RepairTypeModal
            onSelection={(repairType) => {
              setSelection((cur) => ({ ...cur, repairType }));
              closeModal();
            }}
            onClose={closeModal}
            selectedPhone={selection.phone}
          />
        );
      case "phone-screen-color":
        return (
          <PhoneScreenColorModal
            onSelection={(phoneScreenColor) => {
              setSelection((cur) => ({ ...cur, phoneScreenColor }));
              closeModal();
            }}
            onClose={closeModal}
          />
        );
      case "date":
        return (
          <DateModal
            onClose={closeModal}
            onSelection={(date) => {
              setSelection((cur) => ({ ...cur, date }));
              closeModal();
            }}
          />
        );
      case "delivery-type":
        return (
          <>
            <DeliveryTypeModal
              onClose={closeModal}
              onSelection={(deliveryType) => {
                setSelection((cur) => ({
                  ...cur,
                  deliveryType,
                }));
                closeModal();
              }}
              canDeliver={deliveryCheck.can}
              deliverMessage={
                !deliveryCheck.can && deliveryCheck.message
                  ? " - " + deliveryCheck.message
                  : ""
              }
            />
            {locationRequestModal && (
              <LocationRequestModal
                onClose={() => setLocationRequestModal(false)}
                onSelection={(resp) => {
                  setLocationRequest(resp);
                  setLocationRequestModal(false);
                }}
              />
            )}
          </>
        );
      case "pick-up-location":
        return (
          <PickUpLocationModal
            onClose={closeModal}
            onSelection={(address) => {
              setSelection((cur) => ({
                ...cur,
                pickUpLocation: address,
              }));
              closeModal();
            }}
          />
        );
      default:
        return <></>;
    }
  }, [modal, closeModal, selection, deliveryCheck, locationRequestModal]);

  // Check if we can deliver
  const canDeliver = useCallback((userLat: number, userLong: number) => {
    const distanceKm = getDistanceFromLatLonInKm(
      50.75643098431303,
      -1.893119256572048,
      userLat,
      userLong
    );

    if (distanceKm < MAX_PICK_UP_DISTANCE_KM) {
      setCanDeliver({
        can: true,
        message: "",
      });
    } else {
      setCanDeliver({
        can: false,
        message: "Too far",
      });
    }
  }, []);

  // Calculate the price everytime the selection is changed
  useEffect(() => {
    setTotalPrice(calculatePrice(selection));
  }, [selection]);

  // Clear the error when the user performs an action
  useEffect(() => {
    setError("");
  }, [modal]);

  // Check if delivery can be done
  useEffect(() => {
    if (locationRequest) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            canDeliver(latitude, longitude);
          },
          (err) => {
            console.error(err);
            setCanDeliver({
              can: false,
              message:
                err.message === "User denied Geolocation"
                  ? "Enable location"
                  : "Cannot get location",
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
          }
        );
      }
    }
  }, [locationRequest, canDeliver]);

  // Open location request modal
  useEffect(() => {
    if (modal === "delivery-type" && !locationRequest) {
      setLocationRequestModal(true);
    }
  }, [modal, locationRequest]);

  return (
    <>
      <Head>
        <title>Book Phone Repair</title>
      </Head>
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
        {selection.repairType === "screen" && (
          <Option
            number={2.1}
            title="Phone Screen Color"
            inset
            value={selection.phoneScreenColor}
            {...(selection.phoneScreenColor && { check: true })}
            onClick={() => setModal("phone-screen-color")}
          />
        )}
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
        {selection.deliveryType === "pick-up" && (
          <Option
            number={4.1}
            title="Pick-up Address"
            inset
            value={
              selection.pickUpLocation
                ? formatAddress(selection.pickUpLocation)
                : ""
            }
            {...(selection.pickUpLocation && { check: true })}
            onClick={() => setModal("pick-up-location")}
          />
        )}
        <span className={styles.totalPrice}>{`Total: £${totalPrice}`}</span>
        {selection.deliveryType === "drop-off" && (
          <Caption className={styles.dropOffLocation}>
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
        <Caption className={styles.caption}>
          Payment to be taken after satisfactory repair.
        </Caption>
        {error && <span className={styles.errorMessage}>{error}</span>}
        <Button type="cta" onClick={bookRepairWrapper} disabled={isSubmitting}>
          Book
        </Button>
        <Caption className={styles.caption}>
          All repairs are typically done within the hour however this is highly
          dependant on stock availability. If you <b>need</b> your repair done
          within the hour, please call{" "}
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

const formatAddress = (address: Address): string => {
  return `${address.address}, ${address.postcode}, ${address.city}`;
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

const getDistanceFromLatLonInKm = (
  latCenter: number,
  lonCenter: number,
  latComp: number,
  lonComp: number
) => {
  // Radius of the earth in km
  var R = 6371;

  // deg2rad below
  var dLat = deg2rad(latComp - latCenter);
  var dLon = deg2rad(lonComp - lonCenter);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(latCenter)) *
      Math.cos(deg2rad(latComp)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in km
  var d = R * c;
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
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
  inset?: boolean;
}

// The options that are displayed to the user
const Option = ({
  title,
  number,
  value,
  check,
  inset,
  onClick = () => {},
}: OptionProps): JSX.Element => {
  return (
    <StyledContainer
      className={clsx(styles.optionContainer, {
        [styles.inset]: inset,
      })}
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

interface PhoneModalProps {
  onSelection: (phone: string) => void;
  onClose: () => void;
}

const PhoneModal = ({
  onClose = () => {},
  onSelection = () => {},
}: PhoneModalProps): JSX.Element => {
  const copyPhoneArray = [...PHONE_MODELS];
  copyPhoneArray.reverse();

  return (
    <Modal className={styles.modal} onClose={onClose}>
      <Title>1. Phone</Title>
      <ListPicker
        options={copyPhoneArray.map((model) => ({
          key: model,
          text: model,
          value: model,
        }))}
        className={styles.modalContent}
        onSelection={onSelection}
      />
    </Modal>
  );
};

interface RepairTypeModal {
  onSelection: (repairType: string) => void;
  onClose: () => void;
  selectedPhone?: string;
}

const RepairTypeModal = ({
  onClose = () => {},
  onSelection = () => {},
  selectedPhone,
}: RepairTypeModal): JSX.Element => {
  return (
    <Modal className={styles.modal} onClose={onClose}>
      <Title>2. Repair Type</Title>
      <ListPicker
        options={REPAIR_TYPES.map((repairType) => {
          const hasPrice = selectedPhone
            ? typeof PHONE_PRICING[selectedPhone]?.[
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
        onSelection={onSelection}
      />
    </Modal>
  );
};

interface PhoneScreenColorModalProps {
  onClose: () => void;
  onSelection: (phoneScreenColor: RepairSelection["phoneScreenColor"]) => void;
}

const PhoneScreenColorModal = ({
  onClose = () => {},
  onSelection = () => {},
}: PhoneScreenColorModalProps): JSX.Element => {
  return (
    <Modal className={styles.modal} onClose={onClose}>
      <Title>2.1. Phone Screen Color</Title>
      <div className={styles.modalButtonContainer}>
        <Button type="default" onClick={() => onSelection("white")}>
          White
        </Button>
        <Button
          type="default"
          onClick={() => {
            onSelection("black");
          }}
        >
          Black
        </Button>
      </div>
    </Modal>
  );
};

interface DateModalProps {
  onClose: () => void;
  onSelection: (date: Date) => void;
}

const DateModal = ({
  onClose = () => {},
  onSelection = () => {},
}: DateModalProps): JSX.Element => {
  return (
    <Modal className={styles.modal} onClose={onClose}>
      <Title>3. Date</Title>
      <DateTimePicker
        onSelection={onSelection}
        className={styles.modalContent}
      />
    </Modal>
  );
};

interface DeliveryTypeModalProps {
  onClose: () => void;
  onSelection: (deliveryType: RepairSelection["deliveryType"]) => void;
  deliverMessage?: string;
  canDeliver?: boolean;
}

const DeliveryTypeModal = ({
  onClose = () => {},
  onSelection = () => {},
  canDeliver,
  deliverMessage = "",
}: DeliveryTypeModalProps): JSX.Element => {
  return (
    <Modal className={styles.modal} onClose={onClose}>
      <Title>4. Delivery Type</Title>
      <div className={styles.modalButtonContainer}>
        <Button
          type="default"
          onClick={() => onSelection("pick-up")}
          disabled={!canDeliver}
        >
          {`Pick-up (+£${PICK_UP_CHARGE})${deliverMessage}`}
        </Button>
        <Button
          type="default"
          onClick={() => {
            onSelection("drop-off");
          }}
        >
          {"Drop-off"}
        </Button>
      </div>
    </Modal>
  );
};

interface PickUpLocationModalProps {
  onClose: () => void;
  onSelection: (address: RepairSelectionPickUp["pickUpLocation"]) => void;
}

const PickUpLocationModal = ({
  onClose = () => {},
  onSelection = () => {},
}: PickUpLocationModalProps): JSX.Element => {
  return (
    <Modal className={styles.modal} onClose={onClose}>
      <Title>4.1. Pick-up Address</Title>
      <AddressForm onSave={onSelection} />
    </Modal>
  );
};

interface LocationRequestModalProps {
  onClose: () => void;
  onSelection: (response: boolean) => void;
}

const LocationRequestModal = ({
  onClose,
  onSelection,
}: LocationRequestModalProps): JSX.Element => {
  return (
    <Modal className={styles.modal} onClose={onClose}>
      <Title>Enable Location</Title>
      <div className={styles.locationRequestCaption}>
        <Caption>Enable for pick-up</Caption>
      </div>
      <div className={styles.modalButtonContainer}>
        <Button type="default" onClick={() => onSelection(true)}>
          Yes
        </Button>
        <Button type="default" onClick={() => onSelection(false)}>
          No
        </Button>
      </div>
    </Modal>
  );
};

export default BookRepair;
