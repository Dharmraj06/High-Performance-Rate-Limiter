/**
 * PlaceholderBlock
 *
 * A visual placeholder for content that has not been implemented yet.
 * Shows a dashed border box with a label so developers know what goes here.
 *
 * Props:
 *   label  — description of what will be placed here
 *   height — CSS height string (default: '10rem')
 */
export default function PlaceholderBlock({ label, height = '10rem' }) {
  return (
    <div
      className="flex items-center justify-center rounded"
      style={{
        height,
        border: '1px dashed var(--border)',
        backgroundColor: 'var(--bg-subtle)',
      }}
    >
      <span
        className="text-xs uppercase tracking-widest"
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </span>
    </div>
  )
}
