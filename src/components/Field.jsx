export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-rawaa-ink/80 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-rawaa-gray bg-white px-4 py-2.5 text-sm text-rawaa-ink placeholder:text-rawaa-grayDark/70 focus:border-rawaa-red focus:ring-1 focus:ring-rawaa-red outline-none transition ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-rawaa-gray bg-white px-4 py-2.5 text-sm text-rawaa-ink focus:border-rawaa-red focus:ring-1 focus:ring-rawaa-red outline-none transition ${props.className || ""}`}
    />
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-rawaa-red text-white hover:bg-rawaa-redDark",
    outline: "border border-rawaa-red text-rawaa-red hover:bg-rawaa-redTint",
    ghost: "text-rawaa-ink hover:bg-rawaa-gray/60",
  };
  return (
    <button
      {...props}
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
