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
export declare function SelectField({ value, options, onChange, ariaLabel, disabled, wrapperClassName, selectClassName, }: SelectFieldProps): import("react").JSX.Element;
