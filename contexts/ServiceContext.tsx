'use client'

import { createContext, useContext } from 'react'
import type { ServiceCode } from '@/lib/constants/services'

interface ServiceContextType {
  serviceCode: ServiceCode
  serviceName: string
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined)

interface ServiceProviderProps {
  serviceCode: ServiceCode
  serviceName: string
  children: React.ReactNode
}

export function ServiceProvider({ serviceCode, serviceName, children }: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={{ serviceCode, serviceName }}>
      {children}
    </ServiceContext.Provider>
  )
}

export function useServiceCode(): ServiceCode {
  const context = useContext(ServiceContext)

  if (context === undefined) {
    throw new Error('useServiceCode must be used within a ServiceProvider')
  }

  return context.serviceCode
}

export function useServiceName(): string {
  const context = useContext(ServiceContext)

  if (context === undefined) {
    throw new Error('useServiceName must be used within a ServiceProvider')
  }

  return context.serviceName
}
