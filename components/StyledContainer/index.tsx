import clsx from "clsx";
import React, { useState } from "react";
import styles from "./index.module.scss";

export interface StyledContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  pressable?: boolean;
  background?: "default" | "white";
}

const StyledContainer: React.FC<StyledContainerProps> = ({
  className,
  pressable,
  background = "default",
  ...props
}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      className={clsx(styles.StyledContainer, className, {
        [styles.pressable]: pressable,
        [styles.pressed]: pressed,
        [styles.white]: background === "white",
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

export default StyledContainer;
