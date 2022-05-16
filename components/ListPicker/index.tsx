import clsx from "clsx";
import React from "react";
import StyledContainer from "../StyledContainer";
import styles from "./index.module.scss";

export interface ListPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelection?: (value: string) => void;
  options: Option[];
}

interface Option {
  key: string;
  text: string;
  value: any;
}

const ListPicker: React.FC<ListPickerProps> = ({
  onSelection = () => {},
  options,
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx(styles.PhonePicker, className)} {...props}>
      {options.map((option) => (
        <StyledContainer
          key={option.key}
          className={styles.container}
          onClick={() => onSelection(option.value)}
          pressable
        >
          <span>{option.text}</span>
        </StyledContainer>
      ))}
    </div>
  );
};

export default ListPicker;
