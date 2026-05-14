import './ActionPrompt.less';
import { useMemo, useState } from 'react';

export interface ActionPromptToggle {
  id: string;
  label: string;
  description?: string;
  defaultSelected?: boolean;
  disabled?: boolean;
}

export interface ActionPromptCustomInput {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  minRows?: number;
}

export interface ActionPromptOption {
  id: string;
  title: string;
  description?: string;
  recommended?: boolean;
  toggleGroupLabel?: string;
  toggles?: ActionPromptToggle[];
  customInput?: ActionPromptCustomInput;
  disabled?: boolean;
}

export interface ActionPromptSubmitPayload {
  optionId: string;
  selectedToggleIds: string[];
  customInput?: string;
}

export interface ActionPromptProps {
  title?: string;
  question: string;
  options: ActionPromptOption[];
  defaultOptionId?: string;
  submitLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  className?: string;
  onSubmit: (payload: ActionPromptSubmitPayload) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

function resolveInitialOption(options: ActionPromptOption[], defaultOptionId?: string): string {
  const explicit = options.find((option) => option.id === defaultOptionId && !option.disabled);
  if (explicit) return explicit.id;

  const recommended = options.find((option) => option.recommended && !option.disabled);
  if (recommended) return recommended.id;

  return options.find((option) => !option.disabled)?.id ?? options[0]?.id ?? '';
}

function resolveInitialToggles(options: ActionPromptOption[]): Record<string, Record<string, boolean>> {
  return Object.fromEntries(
    options.map((option) => [
      option.id,
      Object.fromEntries(
        (option.toggles ?? []).map((toggle) => [toggle.id, toggle.defaultSelected ?? true]),
      ),
    ]),
  );
}

function resolveInitialCustomInputs(options: ActionPromptOption[]): Record<string, string> {
  return Object.fromEntries(
    options.map((option) => [option.id, option.customInput?.defaultValue ?? '']),
  );
}

export function ActionPrompt({
  title = 'Input required',
  question,
  options,
  defaultOptionId,
  submitLabel = 'Submit answer',
  cancelLabel = 'Cancel',
  disabled,
  className,
  onSubmit,
  onCancel,
}: ActionPromptProps) {
  const initialOptionId = useMemo(
    () => resolveInitialOption(options, defaultOptionId),
    [defaultOptionId, options],
  );
  const [selectedOptionId, setSelectedOptionId] = useState(initialOptionId);
  const [toggleState, setToggleState] = useState(() => resolveInitialToggles(options));
  const [customInputs, setCustomInputs] = useState(() => resolveInitialCustomInputs(options));

  const selectedOption = options.find((option) => option.id === selectedOptionId) ?? options[0];
  const selectedToggleIds = Object.entries(toggleState[selectedOption?.id ?? ''] ?? {})
    .filter(([, selected]) => selected)
    .map(([id]) => id);
  const selectedCustomInput = customInputs[selectedOption?.id ?? ''] ?? '';
  const customInputMissing = Boolean(
    selectedOption?.customInput?.required && selectedCustomInput.trim().length === 0,
  );
  const submitDisabled = Boolean(disabled || !selectedOption || selectedOption.disabled || customInputMissing);

  const handleToggle = (optionId: string, toggle: ActionPromptToggle) => {
    if (disabled || toggle.disabled) return;
    setToggleState((current) => ({
      ...current,
      [optionId]: {
        ...(current[optionId] ?? {}),
        [toggle.id]: !(current[optionId]?.[toggle.id] ?? toggle.defaultSelected ?? true),
      },
    }));
  };

  const handleSubmit = () => {
    if (submitDisabled || !selectedOption) return;
    void onSubmit({
      optionId: selectedOption.id,
      selectedToggleIds,
      customInput: selectedCustomInput.trim(),
    });
  };

  return (
    <section className={`chat-ui-action-prompt ${className ?? ''}`} aria-label={title}>
      <header className="chat-ui-action-prompt-header">
        <span className="chat-ui-action-prompt-icon" aria-hidden="true">
          ?
        </span>
        <span>{title}</span>
      </header>

      <div className="chat-ui-action-prompt-body">
        <p className="chat-ui-action-prompt-question">{question}</p>

        <div className="chat-ui-action-prompt-options" role="radiogroup" aria-label={question}>
          {options.map((option) => {
            const selected = selectedOptionId === option.id;
            return (
              <article
                key={option.id}
                className={`chat-ui-action-option${selected ? ' is-selected' : ''}${option.disabled ? ' is-disabled' : ''}`}
              >
                <button
                  type="button"
                  className="chat-ui-action-option-main"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled || option.disabled}
                  onClick={() => setSelectedOptionId(option.id)}
                >
                  <span className="chat-ui-action-option-copy">
                    <span className="chat-ui-action-option-title">{option.title}</span>
                    {option.description && (
                      <span className="chat-ui-action-option-description">{option.description}</span>
                    )}
                  </span>
                  {option.recommended && (
                    <span className="chat-ui-action-option-badge">Recommended</span>
                  )}
                </button>

                {selected && option.toggles && option.toggles.length > 0 && (
                  <div className="chat-ui-action-toggle-group">
                    {option.toggleGroupLabel && (
                      <div className="chat-ui-action-toggle-title">{option.toggleGroupLabel}</div>
                    )}
                    {option.toggles.map((toggle) => {
                      const checked = toggleState[option.id]?.[toggle.id] ?? toggle.defaultSelected ?? true;
                      return (
                        <button
                          key={toggle.id}
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          className={`chat-ui-action-toggle${checked ? ' is-on' : ''}`}
                          disabled={disabled || toggle.disabled}
                          onClick={() => handleToggle(option.id, toggle)}
                        >
                          <span className="chat-ui-action-toggle-control" aria-hidden="true" />
                          <span className="chat-ui-action-toggle-copy">
                            <span className="chat-ui-action-toggle-label">{toggle.label}</span>
                            {toggle.description && (
                              <span className="chat-ui-action-toggle-description">{toggle.description}</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selected && option.customInput && (
                  <label className="chat-ui-action-custom-input">
                    {option.customInput.label && (
                      <span className="chat-ui-action-custom-label">{option.customInput.label}</span>
                    )}
                    <textarea
                      className="chat-ui-action-custom-textarea"
                      rows={option.customInput.minRows ?? 4}
                      placeholder={option.customInput.placeholder}
                      disabled={disabled || option.disabled}
                      value={customInputs[option.id] ?? ''}
                      onChange={(event) => {
                        setCustomInputs((current) => ({
                          ...current,
                          [option.id]: event.target.value,
                        }));
                      }}
                    />
                  </label>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <footer className="chat-ui-action-prompt-footer">
        {onCancel && (
          <button
            type="button"
            className="chat-ui-action-prompt-cancel"
            disabled={disabled}
            onClick={() => {
              void onCancel();
            }}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          className="chat-ui-action-prompt-submit"
          disabled={submitDisabled}
          onClick={handleSubmit}
        >
          {submitLabel}
        </button>
      </footer>
    </section>
  );
}
