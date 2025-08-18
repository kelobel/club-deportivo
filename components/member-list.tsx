"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, QrCode, UserPlus, Edit, Trash2 } from "lucide-react"
import type { Member } from "@/lib/types"
import { getMembers } from "@/lib/storage"

interface MemberListProps {
  onViewQR?: (member: Member) => void
  onEditMember?: (member: Member) => void
  onDeleteMember?: (member: Member) => void
  onAddMember?: () => void
  refreshTrigger?: number
}

export function MemberList({ onViewQR, onEditMember, onDeleteMember, onAddMember, refreshTrigger }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const loadMembers = () => {
    const allMembers = getMembers()
    setMembers(allMembers)
    setFilteredMembers(allMembers)
  }

  useEffect(() => {
    loadMembers()
  }, [refreshTrigger])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members)
      return
    }

    const filtered = members.filter((member) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        member.firstName.toLowerCase().includes(searchLower) ||
        member.lastName.toLowerCase().includes(searchLower) ||
        member.membershipNumber.includes(searchTerm) ||
        member.email.toLowerCase().includes(searchLower)
      )
    })

    setFilteredMembers(filtered)
  }, [searchTerm, members])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="heading text-2xl">Lista de Miembros</CardTitle>
          <Button onClick={onAddMember} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Agregar Miembro
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, apellido, número de membresía o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No se encontraron miembros que coincidan con la búsqueda." : "No hay miembros registrados."}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {member.firstName} {member.lastName}
                    </h3>
                    <Badge variant="secondary">#{member.membershipNumber}</Badge>
                    {member.hasInsurance && (
                      <Badge variant="outline" className="text-xs">
                        Asegurado
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📧 {member.email}</p>
                    <p>📞 {member.phone}</p>
                    <p>
                      🚨 {member.emergencyContactName} - {member.emergencyContactPhone}
                    </p>
                    {member.hasInsurance && member.insuranceCompany && (
                      <p>
                        🏥 {member.insuranceCompany} - {member.policyNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 sm:mt-0">
                  {onViewQR && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewQR(member)}
                      className="flex items-center gap-1"
                    >
                      <QrCode className="h-3 w-3" />
                      Ver QR
                    </Button>
                  )}
                  {onEditMember && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditMember(member)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  )}
                  {onDeleteMember && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteMember(member)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMembers.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando {filteredMembers.length} de {members.length} miembros
          </div>
        )}
      </CardContent>
    </Card>
  )
}
