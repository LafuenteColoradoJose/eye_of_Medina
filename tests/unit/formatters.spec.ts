import { describe, it, expect } from 'vitest'

// En una app real de Nuxt, si tu función tuviera un "export", podríamos importarla:
// import { formatUptime } from '@/app/utils/formatters'
// Como está declarada internamente en machines.vue por ahora, testeamos la lógica análoga:

const formatUptime = (s: number | null | undefined) => {
  return s ? (Math.floor(s / 86400) + 'd ' + Math.floor((s % 86400) / 3600) + 'h') : '—'
}

describe('Lógica de Formateo de Uptime', () => {
  it('debería devolver "—" si se le pasa nulo o indefinido', () => {
    expect(formatUptime(null)).toBe('—')
    expect(formatUptime(undefined)).toBe('—')
    expect(formatUptime(0)).toBe('—')
  })

  it('debería calcular correctamente los días y horas para un número típico', () => {
    const unDiaYDosHoras = (1 * 86400) + (2 * 3600)
    expect(formatUptime(unDiaYDosHoras)).toBe('1d 2h')
  })
})
