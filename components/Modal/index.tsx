import clsx from "clsx";
import { motion } from "framer-motion";
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
    <motion.div
      animate="modalOpen"
      variants={{
        modalOpen: {
          opacity: [0, 1],
          scale: [0.75, 1.05, 1],
          transition: {
            duration: 0.2,
          },
        },
      }}
      className={styles.modalContainer}
      onClick={onClose}
    >
      <div
        className={clsx(styles.Modal, className)}
        {...props}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
      />
    </motion.div>
  );
};

export default Modal;
