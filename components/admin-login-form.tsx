"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAdmin } from "@/lib/auth"
import type { User } from "@/lib/auth"

interface AdminLoginFormProps {
  onLoginSuccess: (user: User) => void
}

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminLogin = () => {
    setIsLoading(true)
    const adminUser = loginAdmin()
    onLoginSuccess(adminUser)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="heading text-2xl text-primary">Acceso Administrador</CardTitle>
        <CardDescription className="body-text">Acceso directo para administradores (modo prueba)</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAdminLogin} className="w-full" disabled={isLoading} variant="secondary">
          {isLoading ? "Accediendo..." : "Acceder como Administrador"}
        </Button>
      </CardContent>
    </Card>
  )
}
