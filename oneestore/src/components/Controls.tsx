import { useId, useRef, useState } from "react";
import {
  IconCheck,
  IconEye,
  IconMinus,
  IconPlus,
  IconWarn,
} from "../design/icons";
import { useCountUp } from "../lib/hooks";
import { IconButton } from "./Button";

/* ============================================================================
   SegmentedControl — mutually exclusive choice, up to about five options.

   The selected pill is a single translucent element that slides between
   positions rather than one background per segment: the movement is what tells
   you the selection changed, and it is free (transform only).
   ========================================================================== */

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  label,
  size = "md",
  block,
}: {
  items: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
  block?: boolean;
}) {
  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value)
  );
  return (
    <div
      className={`seg seg--${size} ${block ? "seg--block" : ""}`}
      role="tablist"
      aria-label={label}
    >
      <span
        className="seg__thumb glass glass--floating"
        aria-hidden="true"
        style={{
          width: `calc((100% - 6px) / ${items.length})`,
          transform: `translate3d(${index * 100}%,0,0)`,
        }}
      />
      {items.map((i) => (
        <button
          key={i.value}
          type="button"
          role="tab"
          aria-selected={i.value === value}
          className={`seg__item ${i.value === value ? "is-on" : ""}`}
          onClick={() => onChange(i.value)}
        >
          {i.icon}
          <span>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================================================================
   QuantitySelector — the number transitions when it changes, so a tap always
   produces visible feedback even when the value is off by one.
   ========================================================================== */

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const [dir, setDir] = useState<"up" | "down">("up");
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    setDir(delta > 0 ? "up" : "down");
    onChange(next);
  };

  return (
    <div className={`qty qty--${size}`} role="group" aria-label={label}>
      <IconButton
        label="Reduce quantity"
        variant="soft"
        size={size === "lg" ? "md" : "sm"}
        disabled={value <= min}
        onClick={() => step(-1)}
      >
        <IconMinus size={16} />
      </IconButton>
      <span className="qty__value num" aria-live="polite">
        <span key={value} className={`qty__digits qty__digits--${dir}`}>
          {value}
        </span>
      </span>
      <IconButton
        label="Increase quantity"
        variant="soft"
        size={size === "lg" ? "md" : "sm"}
        disabled={value >= max}
        onClick={() => step(1)}
      >
        <IconPlus size={16} />
      </IconButton>
    </div>
  );
}

/* ============================================================================
   Field — text input with a real label (never a placeholder standing in for
   one), inline validation, and optional auto-formatting.

   Validation shows on blur, and from then on as the customer types, so an error
   clears the moment it is fixed — and nothing waits until submit.
   ========================================================================== */

export type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Returns an error message, or null when valid. */
  validate?: (v: string) => string | null;
  hint?: string;
  type?: "text" | "email" | "tel" | "password" | "number";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  format?: (v: string) => string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  multiline?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Lifts validation state to the parent form. */
  onValidity?: (ok: boolean) => void;
  suggestions?: string[];
  autoFocus?: boolean;
};

export function Field({
  label,
  value,
  onChange,
  validate,
  hint,
  type = "text",
  inputMode,
  autoComplete,
  format,
  placeholder,
  required,
  optional,
  multiline,
  icon,
  disabled,
  onValidity,
  suggestions,
  autoFocus,
}: FieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [focused, setFocused] = useState(false);
  const error = touched && validate ? validate(value) : null;
  const ok = touched && !error && value.trim().length > 0;

  const set = (raw: string) => {
    const next = format ? format(raw) : raw;
    onChange(next);
    if (touched && validate) onValidity?.(!validate(next));
  };

  const inputType = type === "password" && reveal ? "text" : type;
  const listId = suggestions ? `${id}-list` : undefined;

  return (
    <div
      className={`field ${error ? "is-error" : ""} ${ok ? "is-ok" : ""} ${
        focused ? "is-focused" : ""
      } ${disabled ? "is-disabled" : ""}`}
    >
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional">Optional</span>}
      </label>
      <div className="field__box">
        {icon && <span className="field__icon">{icon}</span>}
        {multiline ? (
          <textarea
            id={id}
            className="field__input"
            value={value}
            rows={3}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
            onChange={(e) => set(e.target.value)}
            onBlur={() => {
              setTouched(true);
              setFocused(false);
              if (validate) onValidity?.(!validate(value));
            }}
            onFocus={() => setFocused(true)}
          />
        ) : (
          <input
            id={id}
            className="field__input"
            type={inputType}
            value={value}
            inputMode={inputMode}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            list={listId}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
            onChange={(e) => set(e.target.value)}
            onBlur={() => {
              setTouched(true);
              setFocused(false);
              if (validate) onValidity?.(!validate(value));
            }}
            onFocus={() => setFocused(true)}
          />
        )}
        {suggestions && (
          <datalist id={listId}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
        {type === "password" && (
          <IconButton
            label={reveal ? "Hide password" : "Show password"}
            variant="plain"
            size="sm"
            className="field__reveal"
            onClick={() => setReveal((r) => !r)}
          >
            <IconEye size={18} off={reveal} />
          </IconButton>
        )}
        {ok && type !== "password" && (
          <span className="field__ok" aria-hidden="true">
            <IconCheck size={16} />
          </span>
        )}
      </div>
      {error ? (
        <p className="field__error" id={`${id}-err`} role="alert">
          <IconWarn size={14} />
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/* ============================================================================
   OptionRow — a radio or checkbox drawn as a full-width tappable row.
   Used for payment methods, delivery windows, address choices.
   ========================================================================== */

export function OptionRow({
  kind = "radio",
  checked,
  onChange,
  title,
  note,
  trailing,
  icon,
  disabled,
  disabledNote,
  name,
}: {
  kind?: "radio" | "check";
  checked: boolean;
  onChange: () => void;
  title: React.ReactNode;
  note?: React.ReactNode;
  trailing?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  disabledNote?: string;
  name?: string;
}) {
  return (
    <label
      className={`optrow ${checked ? "is-on" : ""} ${disabled ? "is-disabled" : ""}`}
    >
      <input
        type={kind === "radio" ? "radio" : "checkbox"}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="optrow__input"
      />
      <span className={`optrow__mark optrow__mark--${kind}`} aria-hidden="true">
        <IconCheck size={13} />
      </span>
      {icon && <span className="optrow__icon">{icon}</span>}
      <span className="optrow__text">
        <span className="optrow__title">{title}</span>
        {(note || (disabled && disabledNote)) && (
          <span className="optrow__note">{disabled ? disabledNote : note}</span>
        )}
      </span>
      {trailing && <span className="optrow__trailing">{trailing}</span>}
    </label>
  );
}

/* ============================================================================
   Switch
   ========================================================================== */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__knob" />
    </button>
  );
}

/* ============================================================================
   AnimatedTotal — a money figure that counts to its new value.
   The basket and every summary use it so a quantity change is felt.
   ========================================================================== */

export function AnimatedTotal({
  value,
  render,
  className = "",
}: {
  value: number;
  render: (n: number) => string;
  className?: string;
}) {
  const shown = useCountUp(value, 420);
  const prev = useRef(value);
  const rising = value > prev.current;
  prev.current = value;
  return (
    <span
      key={`${value}`}
      className={`atotal num ${rising ? "is-up" : "is-down"} ${className}`}
    >
      {render(shown)}
    </span>
  );
}
