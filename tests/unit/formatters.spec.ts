import { describe, it, expect } from 'vitest'

import { formatUptime } from '../../app/utils/formatters'


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
