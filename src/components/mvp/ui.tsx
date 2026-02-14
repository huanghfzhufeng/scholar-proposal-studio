import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary' | 'danger';
  className?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
};

export const SectionLabel = ({ text }: { text: string }) => (
  <div className="mb-6 inline-flex items-center gap-2">
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0052FF]" />
    </span>
    <span className="font-mono-custom text-xs font-medium uppercase tracking-[0.15em] text-[#0052FF]">{text}</span>
  </div>
);

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  onClick,
  size = 'default',
  disabled = false
}: ButtonProps) => {
  const baseStyle =
    'group relative inline-flex items-center justify-center overflow-hidden rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50';

  const sizes = {
    sm: 'h-9 px-4 text-xs',
    default: 'h-12 px-8 text-sm',
    lg: 'h-14 px-10 text-base'
  };

  const variants = {
    primary: 'bg-gradient-primary text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-blue-500/40',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-blue-50/50 hover:text-[#0052FF]',
    secondary: 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-blue-200 hover:bg-slate-50',
    danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
  };

  return (
    <button disabled={disabled} onClick={onClick} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
      {Icon ? <Icon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /> : null}
    </button>
  );
};

export const Badge = ({
  children,
  color = 'blue'
}: {
  children: ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'slate' | 'rose';
}) => {
  const styles = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-600',
    rose: 'border-rose-100 bg-rose-50 text-rose-700'
  };

  return (
    <span className={`font-mono-custom rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[color]}`}>
      {children}
    </span>
  );
};
