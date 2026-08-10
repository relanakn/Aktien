export function Logo({ size = 44, style }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 44 44"
      aria-label="Relanas Aktien-Weekly"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <rect x="0" y="0" width="44" height="44" fill="var(--color-accent)" />
      <text x="7" y="32" fontFamily="Barlow Condensed, sans-serif" fontSize="30" fontWeight="600" fill="var(--color-bg)">R</text>
      <rect x="26" y="24" width="3" height="8"  fill="var(--color-bg)" opacity="0.55" />
      <rect x="31" y="19" width="3" height="13" fill="var(--color-bg)" opacity="0.75" />
      <rect x="36" y="12" width="3" height="20" fill="var(--color-bg)" />
    </svg>
  )
}

export function SparkLine({ vals, color, width = 86, height = 20 }) {
  if (!vals || vals.length < 2) return null
  const min = Math.min(...vals), max = Math.max(...vals), r = (max - min) || 1
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * 110
    const y = 23 - ((v - min) / r) * 20
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox="0 0 110 26" preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
