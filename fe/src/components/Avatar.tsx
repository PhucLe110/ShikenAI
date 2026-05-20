"use client";

import React from "react";
import styles from "./Avatar.module.css";

type Props = {
  name?: string | null;
  src?: string | null;
  size?: number; // px
};

export default function Avatar({ name, src, size = 40 }: Props) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.max(12, Math.floor(size / 2.5)),
  };

  return (
    <div className={styles.avatar} style={style}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || "avatar"} className={styles.img} />
      ) : (
        <span className={styles.letter}>{initial}</span>
      )}
    </div>
  );
}
