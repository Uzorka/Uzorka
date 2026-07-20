import type { KeyboardEvent } from "react";

/**
 * Props that make a non-button element (div/span used as a control) behave like
 * a button for keyboard and assistive-tech users: focusable, activatable with
 * Enter/Space, and announced as a button.
 */
export function clickable(onClick: () => void, label?: string) {
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
  };
}
