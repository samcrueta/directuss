"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import styles from "./advanced.module.css";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function KnowledgeCheck({ check }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);

  const options = check.options || [];
  const correct = checked && selected === check.answer;

  return (
    <div className={styles.checkCard}>
      <p className={styles.checkQuestion}>{check.question}</p>
      <div className={styles.optionList} role="radiogroup">
        {options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = checked && index === check.answer;
          const isWrong = checked && isSelected && index !== check.answer;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={checked}
              onClick={() => setSelected(index)}
              className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${
                isCorrect ? styles.optionCorrect : ""
              } ${isWrong ? styles.optionWrong : ""}`}
            >
              <span className={styles.optionLetter}>{LETTERS[index] || index + 1}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.checkFoot}>
        {!checked ? (
          <button
            type="button"
            className={styles.runButton}
            disabled={selected === null}
            onClick={() => setChecked(true)}
          >
            Check answer
          </button>
        ) : (
          <>
            <span className={`${styles.checkResult} ${correct ? styles.checkResultOk : styles.checkResultNo}`}>
              {correct ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <CheckCircle2 size={14} /> Correct
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <XCircle size={14} /> Not quite
                </span>
              )}
            </span>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => {
                setChecked(false);
                setSelected(null);
              }}
            >
              <RotateCcw size={12} /> Try again
            </button>
          </>
        )}
      </div>

      {checked && check.explanation ? <p className={styles.explanation}>{check.explanation}</p> : null}
    </div>
  );
}
