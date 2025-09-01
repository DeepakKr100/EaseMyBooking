// src/components/MapLink.jsx
export default function MapLink({
  url,
  label = "Open in Google Maps",
  variant = "primary", // "primary" | "outline" | "ghost"
  size = "sm",         // "sm" | "md" | "lg"
  className = "",
}) {
  if (!url) return null;

  const variantClass =
    variant === "outline" ? "btn-outline"
    : variant === "ghost"  ? "btn-ghost"
    : "btn-primary";

  const sizeClass =
    size === "lg" ? "btn-lg"
    : size === "md" ? "btn-md"
    : "btn-sm";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={[
        "group btn no-underline gap-2",
        variantClass,
        sizeClass,
        "shadow-md hover:shadow-lg active:scale-[.98] transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
        "rounded-full", // pill shape
        className,
      ].join(" ")}
    >
      <PinIcon className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
      <span className="hidden xs:inline">{label}</span>
      <ExternalIcon className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

function PinIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.398 4.86 9.29 5.067 9.503a1.33 1.33 0 0 0 1.866 0C13.14 17.29 18 12.398 18 8c0-3.314-2.686-6-6-6Zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5Z"/>
    </svg>
  );
}

function ExternalIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M14 3h7v7h-2V7.414l-9.293 9.293-1.414-1.414L17.586 6H14V3z" />
      <path d="M5 5h6v2H7v10h10v-4h2v6H5z" />
    </svg>
  );
}