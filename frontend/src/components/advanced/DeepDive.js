"use client";

import styles from "./advanced.module.css";

export default function DeepDive({ items }) {
  if (!items?.length) return null;
  return (
    <div className={styles.deepDive}>
      {items.map((item, index) => (
        <details key={item.title || index} className={styles.deepItem}>
          <summary>{item.title}</summary>
          <p className={styles.deepBody}>{item.body}</p>
        </details>
      ))}
    </div>
  );
}
