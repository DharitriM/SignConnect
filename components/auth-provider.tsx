// "use client"

// import type React from "react"

// import { createContext, useContext, useEffect, useState } from "react"

// interface User {
//   id: string
//   name: string
//   email: string
//   avatar?: string
// }

// interface AuthContextType {
//   user: User | null
//   login: (email: string, password: string) => Promise<boolean>
//   register: (name: string, email: string, password: string) => Promise<boolean>
//   logout: () => Promise<void>
//   loading: boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     checkAuth()
//   }, [])

//   const checkAuth = async () => {
//     try {
//       const response = await fetch("/api/auth/me")
//       if (response.ok) {
//         const userData = await response.json()
//         setUser(userData)
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       })

//       if (response.ok) {
//         const userData = await response.json()
//         setUser(userData)
//         return true
//       }
//       return false
//     } catch (error) {
//       console.error("Login failed:", error)
//       return false
//     }
//   }

//   const register = async (name: string, email: string, password: string): Promise<boolean> => {
//     try {
//       const response = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password }),
//       })

//       if (response.ok) {
//         const userData = await response.json()
//         setUser(userData)
//         return true
//       }
//       return false
//     } catch (error) {
//       console.error("Registration failed:", error)
//       return false
//     }
//   }

//   const logout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST" })
//       setUser(null)
//     } catch (error) {
//       console.error("Logout failed:", error)
//     }
//   }

//   return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }


"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 401) {
        // User not authenticated, this is normal
        setUser(null)
      }
    } catch (error) {
      // Network error or other issues, just set user to null
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error("Registration failed:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

