import { Icon } from "@iconify/react";
import clsx from "clsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { db } from "../../firebase";
import { AVAILABLE_END_TIME, AVAILABLE_START_TIME } from "../../globals";
import { RepairSelection } from "../../pages/book-repair";
import Button from "../Button";
import StyledContainer from "../StyledContainer";
import styles from "./index.module.scss";

export interface DateTimePickerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onSelection?: (date: Date) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  onSelection = () => {},
  children,
  className,
  ...props
}) => {
  const TODAY = new Date();
  const [focussedDate, setFocussedDate] = useState(TODAY);
  const [dayStart, setDayStart] = useState(TODAY.getDay());
  const [dayCount, setDayCount] = useState(focussedDate.getDate());
  const [view, setView] = useState<"month" | "day">("month");
  const [error, setError] = useState("");
  const [existingEntries, setExistingEntries] = useState<RepairSelection[]>([]);
  const [takenSlots, setTakenSlots] = useState<string[]>(["09:00"]);

  useEffect(() => {
    const tempDate1 = new Date(focussedDate);
    tempDate1.setDate(0);
    setDayStart(tempDate1.getDay());

    const tempDate2 = new Date(
      focussedDate.getFullYear(),
      focussedDate.getMonth() + 1,
      0
    );
    setDayCount(tempDate2.getDate());
  }, [focussedDate]);

  useEffect(() => {
    setTakenSlots(
      existingEntries
        .filter((entry) => {
          const tempDate1 = new Date(entry.date);
          tempDate1.setHours(0);
          tempDate1.setMinutes(0);
          tempDate1.setSeconds(0);
          tempDate1.setMilliseconds(0);

          const tempDate2 = new Date(focussedDate);
          tempDate2.setHours(0);
          tempDate2.setMinutes(0);
          tempDate2.setSeconds(0);
          tempDate2.setMilliseconds(0);

          return tempDate1.valueOf() === tempDate2.valueOf();
        })
        .reduce<string[]>((r, entry) => {
          r.push(
            `${("0" + entry.date.getHours()).slice(-2)}:${(
              "0" + entry.date.getMinutes()
            ).slice(-2)}`
          );

          return r;
        }, [])
    );
  }, [focussedDate, existingEntries]);

  useEffect(() => {
    const onLoad = async () => {
      try {
        const entries = await getDocs(
          query(collection(db, "bookings"), where("date", ">=", new Date()))
        );

        const existingEntriesRes = entries.docs.map((entry) => {
          const data = entry.data();
          return {
            ...data,
            date: data.date.toDate(),
          };
        });
        setExistingEntries(existingEntriesRes as RepairSelection[]);
      } catch (e) {
        setError("Failed to load taken time slots");
      }
    };

    onLoad();
  }, []);

  const goBackMonth = useCallback(() => {
    setFocussedDate((curDate) => {
      const tempDate = new Date(curDate);
      tempDate.setMonth(tempDate.getMonth() - 1);
      return tempDate;
    });
  }, []);

  const goForwardMonth = useCallback(() => {
    setFocussedDate((curDate) => {
      const tempDate = new Date(curDate);
      tempDate.setMonth(tempDate.getMonth() + 1);
      return tempDate;
    });
  }, []);

  if (error) {
    return <span>{error}</span>;
  }

  return (
    <div className={clsx(styles.DateTimePicker, className)} {...props}>
      {view === "month" && (
        <>
          <MonthHeader
            month={`${focussedDate.toLocaleString("default", {
              month: "short",
            })} - ${focussedDate.getFullYear()}`}
            onLeftArrowClick={goBackMonth}
            onRightArrowClick={goForwardMonth}
            showLeftArrow={focussedDate.getMonth() !== new Date().getMonth()}
          />
          <MonthDays
            onSelect={(day) => {
              setFocussedDate(
                new Date(
                  focussedDate.getFullYear(),
                  focussedDate.getMonth(),
                  day
                )
              );
              setView("day");
            }}
            dayCount={dayCount}
            dayStart={dayStart}
            hideDays={
              // If current month then hide all days up to the current date
              focussedDate.getMonth() === new Date().getMonth()
                ? new Date().getDate()
                : 0
            }
          />
        </>
      )}
      {view === "day" && (
        <>
          <TimePicker
            date={focussedDate}
            takenSlots={takenSlots}
            onBack={() => setView("month")}
            onSelect={(time) => {
              const hour = parseInt(time.slice(0, 2));
              const minute = parseInt(time.slice(-2));

              if (isNaN(hour) || isNaN(minute)) {
                throw new Error("Failed to parse selected time");
              }

              const selectedDate = new Date(
                focussedDate.getFullYear(),
                focussedDate.getMonth(),
                focussedDate.getDate(),
                hour,
                minute,
                0
              );

              onSelection(selectedDate);
            }}
          />
        </>
      )}
    </div>
  );
};

interface MonthHeaderProps {
  month: string;
  onLeftArrowClick: () => void;
  onRightArrowClick: () => void;
  showLeftArrow?: boolean;
}

// Top section of the calendar
const MonthHeader = ({
  month,
  showLeftArrow = true,
  onLeftArrowClick,
  onRightArrowClick,
}: MonthHeaderProps): JSX.Element => {
  return (
    <div className={styles.MonthHeader}>
      {showLeftArrow && (
        <Icon
          icon="fluent:arrow-left-12-filled"
          height={15}
          className={styles.arrow}
          onClick={onLeftArrowClick}
        />
      )}
      <span className={styles.month}>{month}</span>
      <Icon
        icon="fluent:arrow-right-12-filled"
        height={15}
        className={styles.arrow}
        onClick={onRightArrowClick}
      />
    </div>
  );
};

interface MonthDaysProps {
  onSelect?: (day: number) => void;
  dayStart: number;
  dayCount: number;
  hideDays: number;
}

const MonthDays = ({
  dayCount,
  dayStart,
  hideDays,
  onSelect = () => {},
}: MonthDaysProps): JSX.Element => {
  const days = new Array(dayCount - hideDays).fill(0);

  return (
    <div className={styles.MonthDays}>
      <div className={clsx(styles.dayFill, styles.dayHeader)}>Mon</div>
      <div className={clsx(styles.dayFill, styles.dayHeader)}>Tue</div>
      <div className={clsx(styles.dayFill, styles.dayHeader)}>Wed</div>
      <div className={clsx(styles.dayFill, styles.dayHeader)}>Thu</div>
      <div className={clsx(styles.dayFill, styles.dayHeader)}>Fri</div>
      <div className={clsx(styles.dayFill, styles.dayHeader)}>Sat</div>
      <div className={clsx(styles.dayFill, styles.dayHeader)}>Sun</div>
      {new Array(dayStart + hideDays).fill(0).map((elem, i) => {
        return <div key={i} className={styles.dayFill}></div>;
      })}
      {days.map((elem, i) => (
        <div
          key={i + hideDays + 1}
          onClick={() => {
            onSelect(i + hideDays + 1);
          }}
          className={clsx(styles.dayFill, styles.day)}
        >
          <span>{i + hideDays + 1}</span>
        </div>
      ))}
    </div>
  );
};

interface TimePickerProps {
  date: Date;
  onBack?: () => void;
  onSelect: (time: string) => void;
  takenSlots?: string[];
}

const TimePicker = ({
  date,
  onBack,
  onSelect,
  takenSlots = [],
}: TimePickerProps): JSX.Element => {
  const month = date.toLocaleString("default", { month: "short" });
  const dateNum = date.getDate();

  return (
    <div className={styles.TimePicker}>
      <TimeHeader onBack={onBack} month={month} date={dateNum} />
      <TimeSlots onSelect={onSelect} takenSlots={takenSlots} />
    </div>
  );
};

interface TimeHeader {
  month: string;
  date: number;
  onBack?: () => void;
}

const TimeHeader = ({ month, date, onBack }: TimeHeader): JSX.Element => {
  return (
    <div className={styles.TimeHeader}>
      {onBack && (
        <Icon
          className={styles.backArrow}
          height={15}
          icon="fluent:arrow-left-12-filled"
          onClick={onBack}
        />
      )}
      <span className={styles.date}>
        {month} {date}
      </span>
    </div>
  );
};

interface TimeSlotsProps {
  onSelect: (time: string) => void;
  takenSlots: string[];
}

const TimeSlots = ({
  onSelect,
  takenSlots = [],
}: TimeSlotsProps): JSX.Element => {
  const timeSlots = getTimeSlots();

  return (
    <div className={styles.TimeSlots}>
      {timeSlots.map((slot, i) => (
        <TimeSlot
          key={i}
          available={!takenSlots.includes(slot)}
          time={slot}
          onSelect={() => onSelect(slot)}
        />
      ))}
    </div>
  );
};

interface TimeSlotProps {
  time: string;
  available?: boolean;
  onSelect: () => void;
}

const TimeSlot = ({
  time,
  available,
  onSelect,
}: TimeSlotProps): JSX.Element => {
  return (
    <div className={styles.TimeSlot}>
      <div className={styles.time}>
        <span>{time}</span>
        <div className={styles.slotBar} />
      </div>
      <div className={styles.btnContainer}>
        {available ? (
          <Button type="default" onClick={onSelect}>{`Select ${time}`}</Button>
        ) : (
          <StyledContainer className={styles.takenSlot}>Taken</StyledContainer>
        )}
      </div>
    </div>
  );
};

const getTimeSlots = (): string[] => {
  const startHour = parseInt(AVAILABLE_START_TIME.slice(0, 2));
  const endHour = parseInt(AVAILABLE_END_TIME.slice(0, 2));

  if (isNaN(startHour) || isNaN(endHour)) {
    throw new Error("Failed to get time slots");
  }

  return new Array(endHour - startHour)
    .fill(0)
    .map((elem, i) => ("0" + (i + startHour)).slice(-2) + ":00");
};

export default DateTimePicker;
