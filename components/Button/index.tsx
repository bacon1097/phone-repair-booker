import clsx from "clsx";
import React, { useState } from "react";
import styles from "./index.module.scss";

export interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "default" | "cta";
}

const Button: React.FC<ButtonProps> = ({
  type = "default",
  className,
  ...props
}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      className={clsx(styles.Button, className, {
        [styles.pressed]: pressed,
        [styles.cta]: type === "cta",
      })}
      {...props}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => pressed && setPressed(false)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => pressed && setPressed(false)}
    />
  );
};

export default Button;
