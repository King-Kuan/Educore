import React from "react";

// ── cn helper ──────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── Button ─────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary", size = "md", loading, children, className, disabled, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:   "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-600",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300",
    danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    ghost:     "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
  };
  const sizes = {
    sm:  "px-3 py-1.5 text-xs",
    md:  "px-4 py-2 text-sm",
    lg:  "px-5 py-2.5 text-sm",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <svg className={cn("animate-spin text-brand-600", sz[size])} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── GradeBadge ─────────────────────────────────────────────────────────────
export function GradeBadge({ grade }: { grade: string }) {
  const styles: Record<string, string> = {
    A: "bg-green-50  text-green-800  border-green-200",
    B: "bg-blue-50   text-blue-800   border-blue-200",
    C: "bg-lime-50   text-lime-800   border-lime-200",
    D: "bg-yellow-50 text-yellow-800 border-yellow-200",
    E: "bg-orange-50 text-orange-800 border-orange-200",
    S: "bg-amber-50  text-amber-800  border-amber-200",
    F: "bg-red-50    text-red-800    border-red-200",
  };
  return (
    <span className={cn("inline-block font-mono text-xs px-2 py-0.5 rounded border font-medium", styles[grade] ?? "bg-gray-50 text-gray-600 border-gray-200")}>
      {grade}
    </span>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
interface BadgeProps {
  color?: "green" | "red" | "blue" | "amber" | "gray";
  children: React.ReactNode;
}

export function Badge({ color = "gray", children }: BadgeProps) {
  const styles = {
    green: "bg-green-50 text-green-700 border-green-200",
    red:   "bg-red-50   text-red-700   border-red-200",
    blue:  "bg-blue-50  text-blue-700  border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray:  "bg-gray-100 text-gray-600  border-gray-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border", styles[color])}>
      {children}
    </span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon, title, description, action,
}: {
  icon?:        React.ReactNode;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({
  open, onClose, title, children,
}: {
  open:    boolean;
  onClose: () => void;
  title?:  string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {title && (
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default { Button, Spinner, GradeBadge, Badge, Card, EmptyState, Modal };
