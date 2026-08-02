import { CircleHelp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, RadioGroup, RadioGroupItem, Switch, Textarea } from '../ui/primitives';

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

  const handleToggle = (optionId: string, toggle: ActionPromptToggle, checked: boolean) => {
    if (disabled || toggle.disabled) return;
    setToggleState((current) => ({
      ...current,
      [optionId]: {
        ...(current[optionId] ?? {}),
        [toggle.id]: checked,
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
        <CircleHelp className="chat-ui-action-prompt-icon" aria-hidden="true" />
        <span>{title}</span>
      </header>

      <div className="chat-ui-action-prompt-body">
        <p className="chat-ui-action-prompt-question">{question}</p>

        <RadioGroup
          className="chat-ui-action-prompt-options"
          aria-label={question}
          value={selectedOptionId}
          onValueChange={setSelectedOptionId}
          disabled={disabled}
        >
          {options.map((option) => {
            const selected = selectedOptionId === option.id;
            return (
              <article
                key={option.id}
                className={`chat-ui-action-option${selected ? ' is-selected' : ''}${option.disabled ? ' is-disabled' : ''}`}
              >
                <label
                  className="chat-ui-action-option-main"
                >
                  <RadioGroupItem value={option.id} disabled={option.disabled} aria-label={option.title} />
                  <span className="chat-ui-action-option-copy">
                    <span className="chat-ui-action-option-title">{option.title}</span>
                    {option.description && (
                      <span className="chat-ui-action-option-description">{option.description}</span>
                    )}
                  </span>
                  {option.recommended && (
                    <Badge className="chat-ui-action-option-badge">Recommended</Badge>
                  )}
                </label>

                {selected && option.toggles && option.toggles.length > 0 && (
                  <div className="chat-ui-action-toggle-group">
                    {option.toggleGroupLabel && (
                      <div className="chat-ui-action-toggle-title">{option.toggleGroupLabel}</div>
                    )}
                    {option.toggles.map((toggle) => {
                      const checked = toggleState[option.id]?.[toggle.id] ?? toggle.defaultSelected ?? true;
                      return (
                        <label key={toggle.id} className="chat-ui-action-toggle">
                          <Switch
                            checked={checked}
                            disabled={disabled || toggle.disabled}
                            onCheckedChange={(nextChecked) => handleToggle(option.id, toggle, nextChecked)}
                            aria-label={toggle.label}
                          />
                          <span className="chat-ui-action-toggle-copy">
                            <span className="chat-ui-action-toggle-label">{toggle.label}</span>
                            {toggle.description && (
                              <span className="chat-ui-action-toggle-description">{toggle.description}</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {selected && option.customInput && (
                  <label className="chat-ui-action-custom-input">
                    {option.customInput.label && (
                      <span className="chat-ui-action-custom-label">{option.customInput.label}</span>
                    )}
                    <Textarea
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
        </RadioGroup>
      </div>

      <footer className="chat-ui-action-prompt-footer">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="chat-ui-action-prompt-cancel"
            disabled={disabled}
            onClick={() => {
              void onCancel();
            }}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className="chat-ui-action-prompt-submit"
          disabled={submitDisabled}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
      </footer>
    </section>
  );
}
