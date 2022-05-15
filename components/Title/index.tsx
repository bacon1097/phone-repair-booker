import clsx from "clsx";
import React from "react";
import styles from "./index.module.scss";

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const Title = ({ className, ...props }: TitleProps): JSX.Element => {
  return <h1 className={clsx(styles.Title, className)} {...props} />;
};

export default Title;
