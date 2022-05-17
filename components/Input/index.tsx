import clsx from "clsx";
import React from "react";
import styles from "./index.module.scss";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, ...otherProps }: InputProps): JSX.Element => {
  return <input className={clsx(styles.Input, className)} {...otherProps} />;
};

export default Input;
