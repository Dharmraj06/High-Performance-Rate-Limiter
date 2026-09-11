/**
 * SectionLabel
 *
 * Small uppercase mono label placed above section headings to
 * provide context/category text. e.g. "Architecture", "Results"
 */
export function SectionLabel({ children }) {
  return (
    <p
      className="mb-4 text-xs font-medium uppercase tracking-widest"
      style={{
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.14em',
      }}
    >
      {children}
    </p>
  )
}

/**
 * PageHeading
 *
 * Large h1 used at the top of a page.
 */
export function PageHeading({ children, className = '' }) {
  return (
    <h1
      className={`font-semibold leading-tight tracking-tight ${className}`}
      style={{
        color: 'var(--text-primary)',
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        letterSpacing: '-0.03em',
      }}
    >
      {children}
    </h1>
  )
}

/**
 * SectionHeading
 *
 * h2 used to introduce sub-sections within a page.
 */
export function SectionHeading({ children, className = '' }) {
  return (
    <h2
      className={`font-semibold leading-snug ${className}`}
      style={{
        color: 'var(--text-primary)',
        fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </h2>
  )
}

/**
 * BodyText
 *
 * Standard body paragraph.
 */
export function BodyText({ children, muted = false, className = '' }) {
  return (
    <p
      className={`leading-relaxed ${className}`}
      style={{
        color: muted ? 'var(--text-muted)' : 'var(--text-secondary)',
        fontSize: '15px',
      }}
    >
      {children}
    </p>
  )
}

/**
 * Mono
 *
 * Inline monospace text (for filenames, code snippets, metrics).
 */
export function Mono({ children }) {
  return (
    <code
      className="rounded px-1.5 py-0.5 text-xs"
      style={{
        fontFamily: 'var(--font-mono)',
        backgroundColor: 'var(--bg-subtle)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </code>
  )
}
