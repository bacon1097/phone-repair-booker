import clsx from "clsx";
import React from "react";
import styles from "./index.module.scss";

export interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Caption = ({ className, ...otherProps }: CaptionProps): JSX.Element => {
  return <span className={clsx(styles.Caption, className)} {...otherProps} />;
};

export default Caption;
