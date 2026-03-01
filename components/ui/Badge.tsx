interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantClasses = {
  default: "bg-slate-700 text-slate-200",
  success: "bg-green-900 text-green-200",
  warning: "bg-yellow-900 text-yellow-200",
  danger: "bg-red-900 text-red-200",
  info: "bg-blue-900 text-blue-200",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
