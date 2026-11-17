import { beforeEach, describe, expect, it } from 'vitest'
import { usePersonal } from '../../estado/personal'
import { olvidarVehiculos, vehiculosVisibles } from './registro'

describe('registro de vehículos visibles', () => {
  beforeEach(() => {
    vehiculosVisibles.clear()
    usePersonal.setState({ barreraAbierta: false })
  })
  it('al olvidarlos queda vacío y la barrera baja aunque hubiera un vehículo cerca', () => {
    vehiculosVisibles.set('camioneta', { x: -3.5, y: -79 })
    usePersonal.getState().fijarBarrera(true)
    olvidarVehiculos()
    expect(vehiculosVisibles.size).toBe(0)
    expect(usePersonal.getState().barreraAbierta).toBe(false)
  })
})
