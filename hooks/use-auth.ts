"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type User, getCurrentUser, logout as authLogout } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const logout = () => {
    authLogout()
    setUser(null)
    router.push("/login")
  }

  const updateUser = (newUser: User | null) => {
    setUser(newUser)
  }

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isLoading,
    logout,
    updateUser,
  }
}
