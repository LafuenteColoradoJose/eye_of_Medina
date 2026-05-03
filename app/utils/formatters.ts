export const formatUptime = (s: number | null | undefined): string => {
  return s ? (Math.floor(s / 86400) + 'd ' + Math.floor((s % 86400) / 3600) + 'h') : '—'
}
