"use client"

import { useAuth } from "@/hooks/use-auth"
import { AuthWrapper } from "@/components/auth-wrapper"
import { UserHeader } from "@/components/user-header"
import { MemberManagement } from "@/components/member-management"
import { MemberDashboard } from "@/components/member-dashboard"

export default function HomePage() {
  const { user, isAdmin } = useAuth()

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="heading text-xl sm:text-2xl lg:text-3xl text-primary">
              Club Deportivo - Sistema de Gestión
            </h1>
            <p className="body-text text-muted-foreground mt-2 text-sm sm:text-base">
              Gestión completa de miembros, asistencia y estadísticas
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <UserHeader />

          {isAdmin ? <MemberManagement /> : <MemberDashboard />}
        </main>
      </div>
    </AuthWrapper>
  )
}
