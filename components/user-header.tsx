"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, User, Shield } from "lucide-react"

export function UserHeader() {
  const { user, logout, isAdmin } = useAuth()

  if (!user) return null

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isAdmin ? <Shield className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
              <div>
                <h2 className="heading text-lg">
                  Bienvenido, <span className="text-primary">{user.firstName}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {isAdmin ? (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Administrador
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline">Miembro</Badge>
                      <span className="text-sm text-muted-foreground">Código: {user.memberCode}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
