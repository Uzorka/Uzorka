import { createPortal } from "react-dom";
import { IconCheck, IconClose, IconInfo, IconWarn } from "../design/icons";
import { useStore } from "../state/store";
import { IconButton } from "./Button";

/**
 * Toasts confirm that something worked. They sit above the bottom navigation on
 * phones so they never cover it, and they are polite live regions so a screen
 * reader hears the confirmation without losing the current focus.
 */
export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toasts" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.tone ?? "ok"}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast__icon" aria-hidden="true">
            {t.tone === "bad" ? (
              <IconWarn size={17} />
            ) : t.tone === "info" ? (
              <IconInfo size={17} />
            ) : (
              <IconCheck size={17} />
            )}
          </span>
          <div className="toast__text">
            <p className="toast__title">{t.title}</p>
            {t.body && <p className="toast__body">{t.body}</p>}
          </div>
          {t.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                t.action?.run();
                dismissToast(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <IconButton
            label="Dismiss"
            variant="plain"
            size="sm"
            onClick={() => dismissToast(t.id)}
          >
            <IconClose size={15} />
          </IconButton>
        </div>
      ))}
    </div>,
    document.body
  );
}
