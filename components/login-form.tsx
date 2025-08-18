"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginUser } from "@/lib/auth"
import type { User } from "@/lib/auth"

interface LoginFormProps {
  onLoginSuccess: (user: User) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [firstName, setFirstName] = useState("")
  const [memberCode, setMemberCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!firstName.trim() || !memberCode.trim()) {
      setError("Por favor ingresa tu nombre y código de miembro")
      setIsLoading(false)
      return
    }

    const user = loginUser(firstName.trim(), memberCode.trim())

    if (user) {
      onLoginSuccess(user)
    } else {
      setError("Nombre o código de miembro incorrecto")
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="heading text-2xl text-primary">Iniciar Sesión</CardTitle>
        <CardDescription className="body-text">Ingresa tu nombre y código de miembro</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Primer Nombre</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ej: Juan"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memberCode">Código de Miembro</Label>
            <Input
              id="memberCode"
              type="text"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              placeholder="Ej: 000001"
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
