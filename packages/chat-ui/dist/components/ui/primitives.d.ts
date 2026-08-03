import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, type TextareaHTMLAttributes } from 'react';
declare const buttonVariants: (props?: ({
    variant?: "default" | "ghost" | "outline" | "danger" | null | undefined;
    size?: "sm" | "md" | "icon" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
}
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const Textarea: import("react").ForwardRefExoticComponent<TextareaHTMLAttributes<HTMLTextAreaElement> & import("react").RefAttributes<HTMLTextAreaElement>>;
export declare function Badge({ children, className }: {
    children: React.ReactNode;
    className?: string;
}): import("react").JSX.Element;
export declare const Collapsible: import("react").ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleProps & import("react").RefAttributes<HTMLDivElement>>;
export declare const CollapsibleTrigger: import("react").ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const CollapsibleContent: import("react").ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleContentProps & import("react").RefAttributes<HTMLDivElement>>;
export declare const RadioGroup: import("react").ForwardRefExoticComponent<RadioGroupPrimitive.RadioGroupProps & import("react").RefAttributes<HTMLDivElement>>;
export declare const RadioGroupItem: import("react").ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupItemProps & import("react").RefAttributes<HTMLButtonElement>, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export declare const Switch: import("react").ForwardRefExoticComponent<Omit<SwitchPrimitive.SwitchProps & import("react").RefAttributes<HTMLButtonElement>, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export declare function Tooltip({ label, children }: {
    label: string;
    children: React.ReactElement;
}): import("react").JSX.Element;
export {};
