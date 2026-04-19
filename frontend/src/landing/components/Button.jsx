import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react'; // Assuming lucide-react is installed, matches Navbar icons

const Button = forwardRef(({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  className = '', 
  children, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'h-[42px] rounded-[10px] bg-[#1630b7] hover:bg-[#1d39d1] shadow-sm px-5 uppercase tracking-[0.04em] text-[12px] font-semibold',
    secondary: 'h-[42px] rounded-[10px] border border-white/16 bg-white/5 hover:bg-white/10 text-[12px] font-semibold uppercase tracking-[0.04em] px-5',
    ghost: 'px-4 py-1.5 text-[11px] font-medium rounded-full hover:text-white',
    social: 'h-[62px] w-[62px] rounded-[16px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_24px_rgba(0,0,0,0.3)] hover:border-white/30 text-white',
    toggle: 'px-4 py-1.5 text-[11px] font-medium rounded-full transition',
  };

  const sizes = {
    sm: 'h-[44px] px-4 text-sm',
    md: 'h-[42px|46px] px-5 text-[12px]',
    lg: 'h-[52px] px-6 text-base',
  };

  const effectiveDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={effectiveDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children || 'Please wait...'}
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

