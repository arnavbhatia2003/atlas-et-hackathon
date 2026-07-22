import { cn } from '@/lib/utils'

/**
 * Standard page header: a small status eyebrow (dot + label), a strong title,
 * supporting text, and an optional action slot on the right.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-verified" aria-hidden />
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
