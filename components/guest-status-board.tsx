"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Users, DollarSign, RefreshCw } from "lucide-react"
import type { Member } from "@/lib/types"
import { getMembers, getGuestRecords, getTodayGuestCount } from "@/lib/storage"

interface MemberGuestStatus {
  member: Member
  todayGuests: number
  hasAdditionalCharges: boolean
  guestNames: string[]
}

export function GuestStatusBoard() {
  const [memberStatuses, setMemberStatuses] = useState<MemberGuestStatus[]>([])
  const [filteredStatuses, setFilteredStatuses] = useState<MemberGuestStatus[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyWithGuests, setShowOnlyWithGuests] = useState(false)

  const loadGuestStatuses = () => {
    const members = getMembers()
    const guestRecords = getGuestRecords()
    const today = new Date().toISOString().split("T")[0]

    const statuses: MemberGuestStatus[] = members.map((member) => {
      const todayGuests = getTodayGuestCount(member.id)
      const todayGuestRecords = guestRecords.filter((record) => record.memberId === member.id && record.date === today)

      return {
        member,
        todayGuests,
        hasAdditionalCharges: todayGuestRecords.some((record) => record.additionalCharge > 0),
        guestNames: todayGuestRecords.map((record) => record.guestName),
      }
    })

    setMemberStatuses(statuses)
  }

  useEffect(() => {
    loadGuestStatuses()
  }, [])

  useEffect(() => {
    let filtered = memberStatuses

    if (showOnlyWithGuests) {
      filtered = filtered.filter((status) => status.todayGuests > 0)
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((status) => {
        return (
          status.member.firstName.toLowerCase().includes(searchLower) ||
          status.member.lastName.toLowerCase().includes(searchLower) ||
          status.member.membershipNumber.includes(searchTerm) ||
          status.guestNames.some((name) => name.toLowerCase().includes(searchLower))
        )
      })
    }

    setFilteredStatuses(filtered)
  }, [memberStatuses, searchTerm, showOnlyWithGuests])

  const totalGuestsToday = memberStatuses.reduce((sum, status) => sum + status.todayGuests, 0)
  const membersWithGuests = memberStatuses.filter((status) => status.todayGuests > 0).length
  const totalAdditionalCharges = memberStatuses.filter((status) => status.hasAdditionalCharges).length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invitados Hoy</p>
                <p className="text-2xl font-bold">{totalGuestsToday}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Miembros con Invitados</p>
                <p className="text-2xl font-bold">{membersWithGuests}</p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Con Cargos Adicionales</p>
                <p className="text-2xl font-bold">{totalAdditionalCharges}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Board */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="heading text-2xl">Estado de Invitados - Personal de Recepción</CardTitle>
            <Button
              onClick={loadGuestStatuses}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por miembro o nombre de invitado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowOnlyWithGuests(!showOnlyWithGuests)}
              variant={showOnlyWithGuests ? "default" : "outline"}
              className={showOnlyWithGuests ? "" : "bg-transparent"}
            >
              {showOnlyWithGuests ? "Mostrar Todos" : "Solo con Invitados"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredStatuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || showOnlyWithGuests
                ? "No se encontraron miembros que coincidan con los filtros."
                : "No hay miembros registrados."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStatuses.map((status) => (
                <div
                  key={status.member.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    status.todayGuests > 0 ? "bg-muted/30 border-primary/20" : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {status.member.firstName} {status.member.lastName}
                        </h3>
                        <Badge variant="secondary">#{status.member.membershipNumber}</Badge>
                        {status.hasAdditionalCharges && (
                          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Cargo Adicional
                          </Badge>
                        )}
                      </div>

                      {status.guestNames.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">Invitados de hoy:</p>
                          <p>{status.guestNames.join(", ")}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Invitados</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold">{status.todayGuests}</span>
                          <span className="text-sm text-muted-foreground">/ 2 gratis</span>
                        </div>
                      </div>

                      <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-bold">
                        {status.todayGuests === 0 && <span className="text-muted-foreground">0</span>}
                        {status.todayGuests > 0 && status.todayGuests <= 2 && (
                          <span className="text-green-600">{status.todayGuests}</span>
                        )}
                        {status.todayGuests > 2 && <span className="text-yellow-600">{status.todayGuests}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredStatuses.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {filteredStatuses.length} de {memberStatuses.length} miembros
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
