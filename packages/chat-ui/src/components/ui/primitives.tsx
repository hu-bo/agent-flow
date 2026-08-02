import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = cva('chat-v2-button', {
  variants: { variant: { default: 'is-default', ghost: 'is-ghost', outline: 'is-outline', danger: 'is-danger' }, size: { sm: 'is-sm', md: 'is-md', icon: 'is-icon' } },
  defaultVariants: { variant: 'default', size: 'md' },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = 'Button';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('chat-v2-textarea', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('chat-v2-badge', className)}>{children}</span>;
}

export const Collapsible = CollapsiblePrimitive.Root;
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
export const CollapsibleContent = CollapsiblePrimitive.Content;

export const RadioGroup = RadioGroupPrimitive.Root;
export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item ref={ref} className={cn('chat-v2-radio-item', className)} {...props}>
    <RadioGroupPrimitive.Indicator className="chat-v2-radio-indicator" />
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = 'RadioGroupItem';

export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root ref={ref} className={cn('chat-v2-switch', className)} {...props}>
    <SwitchPrimitive.Thumb className="chat-v2-switch-thumb" />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

export function Tooltip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal><TooltipPrimitive.Content className="chat-v2-tooltip" sideOffset={6}>{label}</TooltipPrimitive.Content></TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
