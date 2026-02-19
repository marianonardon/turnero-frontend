"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api/client"

export interface CustomerUser {
  id: string
  email: string
  name: string
  tenantId: string
  tenant?: {
    id: string
    name: string
    slug: string
  }
}

interface CustomerAuthContextType {
  user: CustomerUser | null
  isLoading: boolean
  login: (email: string, firstName: string, lastName: string, phone?: string) => Promise<void>
  logout: () => void
  setUser: (user: CustomerUser | null) => void
  isAuthenticated: boolean
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('customer_user')
          console.log('🔑 [CustomerAuthContext] Loading user from localStorage:', storedUser ? 'FOUND' : 'NOT FOUND')

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            console.log('👤 [CustomerAuthContext] User loaded:', {
              id: parsedUser.id,
              email: parsedUser.email,
              tenantId: parsedUser.tenantId,
              hasTenant: !!parsedUser.tenant
            })
            setUser(parsedUser)
          } else {
            console.warn('⚠️  [CustomerAuthContext] No user in localStorage - User is NOT authenticated')
          }
        }
      } catch (error) {
        console.error('Error loading customer user from storage:', error)
        localStorage.removeItem('customer_user')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, firstName: string, lastName: string, phone?: string): Promise<void> => {
    try {
      await apiClient.post<{ message: string }>(
        `/${tenantSlug}/customer/auth/login`,
        { email, firstName, lastName, phone }
      )

      // En desarrollo, el backend puede retornar el magic link
      console.log('✅ Magic link request sent for customer:', email)
    } catch (error: any) {
      console.error('Customer login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('customer_user')
    console.log('👋 [CustomerAuthContext] User logged out')
  }

  const setUserState = (newUser: CustomerUser | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('customer_user', JSON.stringify(newUser))
      console.log('💾 [CustomerAuthContext] User saved to localStorage')
    } else {
      localStorage.removeItem('customer_user')
    }
  }

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        setUser: setUserState,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}

export { CustomerAuthProvider as default }
