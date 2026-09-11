/**
 * Section
 *
 * A generic page section wrapper with consistent top/bottom padding
 * and an optional thin top border to separate sections visually.
 *
 * Props:
 *   children   — content
 *   id         — HTML anchor id (for linking)
 *   border     — if true, renders a top border line (default: false)
 *   className  — additional classes
 */
export default function Section({ children, id, border = false, className = '' }) {
  return (
    <section
      id={id}
      className={className}
      style={{
        paddingTop: '3rem',
        paddingBottom: '3rem',
        borderTop: border ? `1px solid var(--border)` : 'none',
      }}
    >
      {children}
    </section>
  )
}
