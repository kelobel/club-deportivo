"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/login-form"
import { AdminLoginForm } from "@/components/admin-login-form"
import { type User, getCurrentUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      router.push("/")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleLoginSuccess = (user: User) => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="heading text-3xl text-primary mb-2">Club Deportivo</h1>
          <p className="body-text text-muted-foreground">Sistema de Gestión</p>
        </div>

        <Tabs defaultValue="member" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="member">Miembro</TabsTrigger>
            <TabsTrigger value="admin">Administrador</TabsTrigger>
          </TabsList>

          <TabsContent value="member" className="mt-6">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>

          <TabsContent value="admin" className="mt-6">
            <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
