import type {
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'

const HEX = /^#[0-9a-f]{6}$/i

export const controller = (
  config: FieldControllerConfig
): FieldController<string, string> => ({
  fieldKey: config.fieldKey,
  label: config.label,
  description: config.description,
  graphqlSelection: config.fieldKey,
  defaultValue: '#4f46e5',
  deserialize: (data) => {
    const value = data[config.fieldKey]
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && typeof (value as any).hex === 'string') {
      return (value as any).hex
    }
    return '#4f46e5'
  },
  serialize: (value) => ({ [config.fieldKey]: value }),
})

export function Field({
  field,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) {
  const disabled = onChange === undefined
  const safe = typeof value === 'string' && HEX.test(value) ? value : '#4f46e5'

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label
        htmlFor="keystone-color-token"
        style={{ fontSize: 12, fontWeight: 600, color: 'var(--theme-elevation-800)' }}
      >
        {field.label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          aria-label={`${field.label} picker`}
          type="color"
          value={safe}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(event) => onChange?.(event.target.value)}
          style={{
            width: 44,
            height: 38,
            padding: 2,
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-elevation-0)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <input
          id="keystone-color-token"
          type="text"
          value={value ?? ''}
          disabled={disabled}
          spellCheck={false}
          onChange={(event) => onChange?.(event.target.value)}
          style={{
            width: 140,
            padding: '9px 10px',
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-1000)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 13,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            background: safe,
            border: '1px solid var(--theme-elevation-200)',
          }}
        />
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--theme-elevation-500)' }}>
        Six-digit hex. Stored as JSON and rendered as a CSS variable.
      </p>
    </div>
  )
}
