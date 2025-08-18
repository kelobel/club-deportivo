"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MemberForm } from "./member-form"
import { MemberList } from "./member-list"
import { QRGenerator } from "./qr-generator"
import { QRScanner } from "./qr-scanner"
import { AttendanceHistory } from "./attendance-history"
import { GuestRegistration } from "./guest-registration"
import { GuestStatusBoard } from "./guest-status-board"
import { ChargesManagement } from "./charges-management"
import { AdminDashboard } from "./admin-dashboard"
import { toast } from "@/hooks/use-toast"
import type { Member } from "@/lib/types"
import { deleteMember } from "@/lib/storage"

export function MemberManagement() {
  const [currentView, setCurrentView] = useState<"list" | "add" | "edit">("list")
  const [selectedMember, setSelectedMember] = useState<Member | undefined>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleAddMember = () => {
    setSelectedMember(undefined)
    setCurrentView("add")
  }

  const handleEditMember = (member: Member) => {
    setSelectedMember(member)
    setCurrentView("edit")
  }

  const handleDeleteMember = (member: Member) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${member.firstName} ${member.lastName}?\n\nEsta acción no se puede deshacer.`,
    )

    if (confirmed) {
      try {
        deleteMember(member.id)
        toast({
          title: "Miembro eliminado",
          description: `${member.firstName} ${member.lastName} ha sido eliminado exitosamente.`,
        })
        setRefreshTrigger((prev) => prev + 1)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el miembro. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSuccess = () => {
    setCurrentView("list")
    setSelectedMember(undefined)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleFormCancel = () => {
    setCurrentView("list")
    setSelectedMember(undefined)
  }

  const handleScanSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleNavigateToSection = (section: string) => {
    setActiveTab(section)
  }

  const handleBackToList = () => {
    setSelectedMember(undefined)
  }

  if (currentView === "add" || currentView === "edit") {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <MemberForm member={selectedMember} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="members" className="text-xs sm:text-sm">
            Miembros
          </TabsTrigger>
          <TabsTrigger value="scanner" className="text-xs sm:text-sm">
            Registro
          </TabsTrigger>
          <TabsTrigger value="qr-generator" className="text-xs sm:text-sm">
            QR
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="guests" className="text-xs sm:text-sm">
            Invitados
          </TabsTrigger>
          <TabsTrigger value="guest-status" className="text-xs sm:text-sm">
            Estado
          </TabsTrigger>
          <TabsTrigger value="charges" className="text-xs sm:text-sm">
            Cargos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 sm:mt-6">
          <AdminDashboard onNavigateToSection={handleNavigateToSection} />
        </TabsContent>

        <TabsContent value="members" className="mt-4 sm:mt-6">
          <MemberList
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onAddMember={handleAddMember}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="scanner" className="mt-4 sm:mt-6">
          <QRScanner onScanSuccess={handleScanSuccess} />
        </TabsContent>

        <TabsContent value="qr-generator" className="mt-4 sm:mt-6">
          <div className="space-y-4 sm:space-y-6">
            {selectedMember ? (
              <QRGenerator member={selectedMember} onBack={handleBackToList} />
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Selecciona un miembro para generar su código QR
                </p>
                <MemberList
                  onViewQR={(member) => setSelectedMember(member)}
                  onAddMember={handleAddMember}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 sm:mt-6">
          <AttendanceHistory />
        </TabsContent>

        <TabsContent value="guests" className="mt-4 sm:mt-6">
          <GuestRegistration />
        </TabsContent>

        <TabsContent value="guest-status" className="mt-4 sm:mt-6">
          <GuestStatusBoard />
        </TabsContent>

        <TabsContent value="charges" className="mt-4 sm:mt-6">
          <ChargesManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
