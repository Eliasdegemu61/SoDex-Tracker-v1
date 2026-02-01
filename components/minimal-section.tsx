import { ReactNode } from 'react'

interface MinimalSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  showBorder?: boolean
  noPadding?: boolean
}

export function MinimalSection({
  title,
  subtitle,
  children,
  className = '',
  showBorder = true,
  noPadding = false,
}: MinimalSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || subtitle) && (
        <div className={`${showBorder ? 'border-b border-border/30 pb-4' : ''}`}>
          {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={!noPadding ? '' : ''}>{children}</div>
    </section>
  )
}
