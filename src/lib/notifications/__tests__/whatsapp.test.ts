import { describe, it, expect } from 'vitest'
import { formatPhone } from '@/lib/notifications/whatsapp'

describe('formatPhone', () => {
  it('remove máscara e mantém DDI 55', () => {
    expect(formatPhone('55 (11) 99999-9999')).toBe('5511999999999')
  })

  it('adiciona DDI 55 quando ausente', () => {
    expect(formatPhone('(11) 99999-9999')).toBe('5511999999999')
  })

  it('lida com número já limpo', () => {
    expect(formatPhone('5511988887777')).toBe('5511988887777')
  })

  it('remove espaços, traços e parênteses', () => {
    expect(formatPhone('11 9 8888-7777')).toBe('5511988887777')
  })
})
