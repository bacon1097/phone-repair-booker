import clsx from "clsx";
import React from "react";
import styles from "./index.module.scss";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  className,
  onClose = () => {},
  onClick = () => {},
  ...props
}) => {
  return (
    <div className={styles.modalContainer} onClick={onClose}>
      <div
        className={clsx(styles.Modal, className)}
        {...props}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
      />
    </div>
  );
};

export default Modal;
