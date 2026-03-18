import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface BaseInputProps {
  label?: string;
  error?: string;
}

interface InputFieldProps
  extends BaseInputProps,
    InputHTMLAttributes<HTMLInputElement> {
  as?: "input";
}

interface TextareaFieldProps
  extends BaseInputProps,
    TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: "textarea";
}

type InputProps = InputFieldProps | TextareaFieldProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const id = props.id || props.name;
    const baseClasses =
      "block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500";
    const errorClasses = error
      ? "border-red-300 text-red-900 placeholder-red-300"
      : "border-gray-300 text-gray-900 placeholder-gray-400";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        {props.as === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            className={`${baseClasses} ${errorClasses} ${className}`}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            className={`${baseClasses} ${errorClasses} ${className}`}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
