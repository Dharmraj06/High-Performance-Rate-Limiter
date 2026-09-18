/**
 * ArchNode
 *
 * A single node/box in an architecture diagram.
 *
 * Props:
 *   label     — main label text
 *   sub       — small secondary line below label
 *   highlight — if true, uses stronger border contrast
 *   mono      — if true, renders label in monospace
 *   className — additional class names
 */
export function ArchNode({ label, sub, highlight = false, mono = false, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded px-4 py-3.5 text-center ${className}`}
      style={{
        backgroundColor: highlight ? 'var(--bg-subtle)' : 'var(--bg-surface)',
        border: `1px solid ${highlight ? 'var(--border-strong)' : 'var(--border)'}`,
        minWidth: '8rem',
      }}
    >
      <span
        className="text-sm font-medium leading-snug"
        style={{
          color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          className="mt-1.5 text-[11px] sm:text-xs leading-snug"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {sub}
        </span>
      )}
    </div>
  )
}

/**
 * ArchArrow
 *
 * A directional arrow connector between ArchNodes.
 * Supports horizontal ('right') and vertical ('down') orientations.
 *
 * Props:
 *   label     — optional small label above or beside arrow
 *   direction — 'right' | 'down' (default: 'right')
 */
export function ArchArrow({ label, direction = 'right' }) {
  if (direction === 'down') {
    return (
      <div className="flex flex-col items-center justify-center py-2">
        {label && (
          <span
            className="mb-2 text-[11px] sm:text-xs leading-none"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {label}
          </span>
        )}
        <div className="flex flex-col items-center">
          <div
            className="w-px h-5 sm:h-6"
            style={{ backgroundColor: 'var(--border)' }}
          />
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            aria-hidden="true"
            style={{ color: 'var(--text-muted)', marginTop: '-1px' }}
          >
            <path
              d="M4 0 L4 8 M1 5 L4 8 L7 5"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-2 sm:px-4">
      {label && (
        <span
          className="text-[11px] sm:text-xs leading-none whitespace-nowrap"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
      )}
      <div className="flex items-center">
        <div
          className="h-px w-4 sm:w-6"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          aria-hidden="true"
          style={{ color: 'var(--text-muted)', flexShrink: 0 }}
        >
          <path
            d="M0 4 L8 4 M5 1 L8 4 L5 7"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

/**
 * ArchDiagram
 *
 * Wrapper that lays out ArchNodes and ArchArrows horizontally or vertically.
 */
export function ArchDiagram({ children, className = '', direction = 'row' }) {
  return (
    <div
      className={`flex ${direction === 'column' ? 'flex-col gap-4' : 'flex-wrap items-center justify-center gap-y-6 gap-x-0'} ${direction === 'column' ? 'items-center justify-center' : ''} ${className}`}
      role="img"
      aria-label="Architecture diagram"
    >
      {children}
    </div>
  )
}
