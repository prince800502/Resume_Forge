import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    leftIcon, 
    rightIcon, 
    fullWidth = false,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white hover:from-cosmic-700 hover:to-nebula-700 focus-visible:ring-cosmic-500 shadow-lg shadow-cosmic-500/25',
      secondary: 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)] focus-visible:ring-[var(--ring)]',
      ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] focus-visible:ring-[var(--ring)]',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500 shadow-lg shadow-red-500/25',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'input',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx('input min-h-[100px] resize-y', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20', className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'card',
      hover: 'card-hover',
      glass: 'glass rounded-2xl',
    }

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={clsx(variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Badge component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'cosmic'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]',
      success: 'bg-green-500/20 text-green-400 border border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
      info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      cosmic: 'bg-gradient-to-r from-cosmic-500/20 to-nebula-500/20 text-cosmic-400 border border-cosmic-500/30',
    }

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1 text-sm',
    }

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-green-500' : variant === 'warning' ? 'bg-yellow-500' : variant === 'danger' ? 'bg-red-500' : variant === 'info' ? 'bg-blue-500' : 'bg-cosmic-500'}`} />}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Avatar component
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', shape = 'circle', className = '', ...props }, ref) => {
    const sizeStyles = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    }

    const shapeStyles = {
      circle: 'rounded-full',
      square: 'rounded-xl',
    }

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const getColorFromName = (name: string) => {
      const colors = [
        'bg-cosmic-500', 'bg-nebula-500', 'bg-emerald-500', 'bg-amber-500',
        'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-indigo-500',
      ]
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    }

    if (src) {
      return (
        <div
          ref={ref}
          className={clsx('relative overflow-hidden', sizeStyles[size], shapeStyles[shape], className)}
          {...props}
        >
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'flex items-center justify-center font-semibold text-white',
          sizeStyles[size],
          shapeStyles[shape],
          name ? getColorFromName(name) : 'bg-[var(--void-600)]',
          className
        )}
        {...props}
      >
        {name ? getInitials(name) : '?'}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

// Divider component
interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  label?: string
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', label, className = '', ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <hr
          ref={ref}
          className={clsx('h-full w-px bg-[var(--border)]', className)}
          {...props}
        />
      )
    }

    return (
      <div className={clsx('flex items-center gap-4', className)} {...props}>
        <hr className="flex-1 h-px bg-[var(--border)] border-0" ref={ref} />
        {label && <span className="text-sm text-[var(--muted-foreground)] whitespace-nowrap">{label}</span>}
        <hr className="flex-1 h-px bg-[var(--border)] border-0" />
      </div>
    )
  }
)

Divider.displayName = 'Divider'

// Tooltip component
interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({ content, children, position = 'top', delay = 200 }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {React.cloneElement(children, { 
        'aria-describedby': visible ? 'tooltip' : undefined 
      })}
      {visible && (
        <div
          id="tooltip"
          role="tooltip"
          className={clsx(
            'absolute z-50 px-3 py-2 text-xs font-medium text-white bg-[var(--void-900)] rounded-lg shadow-void whitespace-nowrap animate-in',
            {
              'bottom-full left-1/2 -translate-x-1/2 mb-2': position === 'top',
              'top-full left-1/2 -translate-x-1/2 mt-2': position === 'bottom',
              'right-full top-1/2 -translate-y-1/2 mr-2': position === 'left',
              'left-full top-1/2 -translate-y-1/2 ml-2': position === 'right',
            }
          )}
        >
          {content}
          <div className={clsx(
            'absolute w-0 h-0 border-4 border-transparent',
            {
              'top-full left-1/2 -translate-x-1/2 border-t-[var(--void-900)]': position === 'top',
              'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--void-900)]': position === 'bottom',
              'right-full top-1/2 -translate-y-1/2 border-r-[var(--void-900)]': position === 'left',
              'left-full top-1/2 -translate-y-1/2 border-l-[var(--void-900)]': position === 'right',
            }
          )} />
        </div>
      )}
    </div>
  )
}

// Modal component
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', className = '' }: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen) return

    const overlay = overlayRef.current
    const content = contentRef.current
    if (!overlay || !content) return

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(content, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' })

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleClose = () => {
    const overlay = overlayRef.current
    const content = contentRef.current
    if (!overlay || !content) {
      onClose()
      return
    }

    gsap.to(overlay, { opacity: 0, duration: 0.2 })
    gsap.to(content, { opacity: 0, scale: 0.95, y: 20, duration: 0.2, ease: 'power3.in', onComplete: onClose })
  }

  if (!isOpen) return null

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={contentRef}
        className={clsx(
          'relative w-full rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-void overflow-hidden',
          sizeStyles[size],
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-[var(--border)]">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-[var(--muted-foreground)]">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Tabs component
interface TabsProps {
  defaultValue: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContext = React.createContext<{ value: string; onChange: (v: string) => void } | null>(null)

export function Tabs({ defaultValue, onValueChange, children, className = '' }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)

  const handleChange = (newValue: string) => {
    setValue(newValue)
    onValueChange(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={clsx('data-[orientation=horizontal]:flex', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={clsx('inline-flex h-10 items-center justify-center rounded-xl bg-[var(--muted)] p-1 text-[var(--muted-foreground)]', className)}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, disabled, className = '' }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { value: currentValue, onChange } = context
  const isActive = currentValue === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-content-${value}`}
      id={`tabs-trigger-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
          : 'hover:text-[var(--foreground)]',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const { value: currentValue } = context
  const isActive = currentValue === value

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={`tabs-content-${value}`}
      aria-labelledby={`tabs-trigger-${value}`}
      className={clsx('mt-4 animate-in', className)}
    >
      {children}
    </div>
  )
}

// Progress component
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  variant?: 'default' | 'cosmic' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

export function Progress({ value, max = 100, showLabel = false, variant = 'default', size = 'md', className = '', ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variantStyles = {
    default: 'bg-gradient-to-r from-cosmic-500 to-nebula-500',
    cosmic: 'bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cyan-500 bg-[length:200%_auto] animate-gradient',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500',
    warning: 'bg-gradient-to-r from-amber-500 to-yellow-500',
  }

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className="w-full" {...props}>
      <div className={clsx('relative overflow-hidden rounded-full bg-[var(--muted)]', sizeStyles[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', variantStyles[variant])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>{Math.round(percentage)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
    </div>
  )
}

// Toggle/Switch component
interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={clsx('flex items-start gap-3', className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="peer h-5 w-5 appearance-none rounded-full border-2 border-[var(--border)] bg-[var(--card)] transition-all duration-200 checked:border-cosmic-500 checked:bg-cosmic-500 focus:outline-none focus:ring-2 focus:ring-cosmic-500/50 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-3.5 after:w-3.5 after:rounded-full after:bg-white after:shadow-md after:transition-transform peer-checked:after:translate-x-full dark:after:bg-white"
            {...props}
          />
        </div>
        {label && (
          <div className="min-w-0">
            <label htmlFor={toggleId} className="text-sm font-medium text-[var(--foreground)]">
              {label}
            </label>
            {description && (
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string; disabled?: boolean }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx('input appearance-none pr-10', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20', className)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--muted-foreground)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'