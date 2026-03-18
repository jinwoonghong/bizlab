interface BadgeProps {
  text: string;
  variant?: "default" | "outline";
  removable?: boolean;
  onRemove?: () => void;
}

export default function Badge({
  text,
  variant = "default",
  removable = false,
  onRemove,
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantClasses =
    variant === "default"
      ? "bg-indigo-50 text-indigo-700"
      : "border border-indigo-300 text-indigo-700";

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {text}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600"
          aria-label={`Remove ${text}`}
        >
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
