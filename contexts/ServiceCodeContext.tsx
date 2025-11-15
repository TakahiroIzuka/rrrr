'use client'

import { createContext, useContext } from 'react'
import type { ServiceCode } from '@/lib/constants/services'

interface ServiceCodeContextType {
  serviceCode: ServiceCode
}

const ServiceCodeContext = createContext<ServiceCodeContextType | undefined>(undefined)

interface ServiceCodeProviderProps {
  serviceCode: ServiceCode
  children: React.ReactNode
}

export function ServiceCodeProvider({ serviceCode, children }: ServiceCodeProviderProps) {
  return (
    <ServiceCodeContext.Provider value={{ serviceCode }}>
      {children}
    </ServiceCodeContext.Provider>
  )
}

export function useServiceCode(): ServiceCode {
  const context = useContext(ServiceCodeContext)

  if (context === undefined) {
    throw new Error('useServiceCode must be used within a ServiceCodeProvider')
  }

  return context.serviceCode
}
