import clsx from "clsx";
import React from "react";
import styles from "./index.module.scss";

export interface StyledContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  
}

const StyledContainer: React.FC<StyledContainerProps> = ({ className, ...props }) => {
  return (
    <div className={clsx(styles.StyledContainer, className)} {...props} />
  );
}

export default StyledContainer;