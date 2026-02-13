"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/endpoints"

export interface AuthUser {
  id: string
  email: string
  name?: string
  tenantId: string
  tenant?: {
    id: string
    name: string
    slug: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('auth_user')
          console.log('🔑 [AuthContext] Loading user from localStorage:', storedUser ? 'FOUND' : 'NOT FOUND')

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            console.log('👤 [AuthContext] User loaded:', {
              id: parsedUser.id,
              email: parsedUser.email,
              tenantId: parsedUser.tenantId,
              hasTenant: !!parsedUser.tenant
            })
            setUser(parsedUser)
          } else {
            console.warn('⚠️  [AuthContext] No user in localStorage - User is NOT authenticated')
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error)
        localStorage.removeItem('auth_user')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string) => {
    try {
      const data = await authApi.login({ email })
      
      // En desarrollo, mostrar el link en consola
      if (data.magicLink) {
        console.log('🔗 Magic Link (solo en desarrollo):', data.magicLink)
        alert(`En desarrollo: Magic link generado. Abre este link: ${data.magicLink}`)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }


  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    router.push('/login')
  }

  const setUserState = (newUser: AuthUser | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('auth_user')
    }
  }

  return (
    <AuthContext.Provider
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
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Exportar verifyToken para usar en la página de callback
export { AuthProvider as default }
