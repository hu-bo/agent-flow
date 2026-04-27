export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  wrapperClassName?: string;
  selectClassName?: string;
}

const BASE_SELECT_CLASS =
  'peer h-8 w-full appearance-none rounded-xl border border-transparent bg-[color:var(--chat-panel-soft)] pl-3 pr-8 text-[11px] font-medium tracking-[0.01em] text-[color:var(--chat-text-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-[color:var(--chat-panel)] focus-visible:border-[color:var(--chat-brand-500)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55';

function joinClasses(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export function SelectField({
  value,
  options,
  onChange,
  ariaLabel,
  disabled,
  wrapperClassName,
  selectClassName,
}: SelectFieldProps) {
  return (
    <div className={joinClasses('relative', wrapperClassName)}>
      <select
        className={joinClasses(BASE_SELECT_CLASS, selectClassName)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[color:var(--chat-text-subtle)] transition peer-disabled:opacity-45"
      >
        <path
          d="M4 6.25L8 10.25L12 6.25"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    </div>
  );
}
