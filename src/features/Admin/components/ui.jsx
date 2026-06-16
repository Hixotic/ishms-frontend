export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    active: "bg-green-50 text-green-700",
    busy: "bg-amber-50 text-amber-700",
    offline: "bg-slate-100 text-slate-500",
    suspended: "bg-red-50 text-red-600",
    critical: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
    resolved: "bg-green-50 text-green-700",
    reviewed: "bg-blue-50 text-blue-700",
    Nurse: "bg-blue-50 text-blue-700",
    Doctor: "bg-purple-50 text-purple-700",
    Admin: "bg-red-50 text-red-700",
    HOD: "bg-cyan-50 text-cyan-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {(variant === "active" || variant === "busy" || variant === "offline") && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${variant === "active" ? "bg-green-500" : variant === "busy" ? "bg-amber-500" : "bg-slate-400"}`} />
      )}
      {children}
    </span>
  );
}

export function Avatar({ initials, color = "#2563EB", size = "md" }) {
  const sizes = { sm: "w-7 h-7 text-xs rounded-lg", md: "w-9 h-9 text-sm rounded-xl", lg: "w-11 h-11 text-base rounded-xl" };
  return (
    <div className={`flex items-center justify-center font-bold text-white flex-shrink-0 font-manrope ${sizes[size]}`} style={{ background: color }}>
      {initials}
    </div>
  );
}

export function Card({ children, className = "", hover = false }) {
  return (
    <div className={`bg-card rounded-2xl shadow-card ${hover ? "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return <h3 className="font-manrope font-bold text-txt-primary text-[15px]">{children}</h3>;
}

export function Button({ children, variant = "outline", size = "md", onClick, className = "", disabled = false }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-150 cursor-pointer border";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-accent text-white border-accent hover:bg-blue-700",
    outline: "bg-transparent text-txt-primary border-slate-200 hover:bg-surf",
    danger: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
    success: "bg-green-50 text-green-700 border-green-100 hover:bg-green-100",
    ghost: "bg-transparent text-txt-secondary border-transparent hover:bg-surf",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Input({ placeholder, value, onChange, icon, className = "", type = "text" }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`h-9 rounded-lg border border-slate-200 bg-surf text-txt-primary text-[13px] outline-none focus:border-accent focus:bg-white transition-colors ${icon ? "pl-8 pr-3" : "px-3"} ${className}`}
      />
    </div>
  );
}

export function Select({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-9 rounded-lg border border-slate-200 bg-surf text-txt-primary text-[13px] px-3 outline-none focus:border-accent cursor-pointer ${className}`}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className="relative bg-card rounded-2xl shadow-card-hover w-full max-w-lg mx-4 overflow-hidden animate-[fadeIn_.15s_ease]" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-manrope font-bold text-txt-primary text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-txt-muted hover:bg-surf transition-colors">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map(h => (
              <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-txt-secondary uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ children }) {
  return <tr className="border-b border-slate-50 hover:bg-surf/60 transition-colors">{children}</tr>;
}

export function TableCell({ children, className = "" }) {
  return <td className={`px-5 py-3.5 ${className}`}>{children}</td>;
}

export function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-card-hover bg-card border pointer-events-auto min-w-[280px] animate-[slideIn_.2s_ease] ${t.type === "success" ? "border-green-200" : t.type === "error" ? "border-red-200" : "border-blue-200"}`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === "success" ? "bg-success" : t.type === "error" ? "bg-danger" : "bg-accent"}`} />
          <span className="text-[13px] font-medium text-txt-primary flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="text-txt-muted hover:text-txt-primary text-lg leading-none">✕</button>
        </div>
      ))}
    </div>
  );
}
