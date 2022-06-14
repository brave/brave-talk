// exported for testing
export function formatRelativeDay (d: Date): string {
  const getDateString = (epochMs: number) =>
    new Date(epochMs).toLocaleDateString()

  const now = new Date().getTime()
  const offsets = {
    Today: getDateString(now),
    Yesterday: getDateString(now - 24 * 60 * 60 * 1000),
    Tomorrow: getDateString(now + 24 * 60 * 60 * 1000)
  }

  const s = d.toLocaleDateString()
  let result = s

  Object.entries(offsets).forEach(([prefix, formattedString]) => {
    if (s === formattedString) result = prefix
  })

  return result
}

export function formatDuration (s: number): string {
  const pos = s >= 3600 ? 11 : 14
  const len = s >= 3600 ? 8 : 5

  return new Date(s * 1000).toISOString().substr(pos, len)
}
