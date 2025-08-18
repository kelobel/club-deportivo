"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, UserPlus, AlertTriangle, DollarSign } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Member, GuestRecord, AdditionalCharge } from "@/lib/types"
import {
  getMembers,
  getTodayGuestCount,
  saveGuestRecord,
  saveAdditionalCharge,
  findMemberByMembershipNumber,
} from "@/lib/storage"

const GUEST_LIMIT = 2
const ADDITIONAL_GUEST_FEE = 10 // Fee in currency units

export function GuestRegistration() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [guestName, setGuestName] = useState("")
  const [todayGuestCount, setTodayGuestCount] = useState(0)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    setMembers(getMembers())
  }, [])

  useEffect(() => {
    if (selectedMember) {
      const count = getTodayGuestCount(selectedMember.id)
      setTodayGuestCount(count)
    }
  }, [selectedMember])

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.membershipNumber.includes(searchTerm)
    )
  })

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member)
    setSearchTerm(`${member.firstName} ${member.lastName} - #${member.membershipNumber}`)
  }

  const handleRegisterGuest = async () => {
    if (!selectedMember || !guestName.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Selecciona un miembro e ingresa el nombre del invitado.",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)

    try {
      const currentGuestCount = getTodayGuestCount(selectedMember.id)
      const willExceedLimit = currentGuestCount >= GUEST_LIMIT
      const additionalCharge = willExceedLimit ? ADDITIONAL_GUEST_FEE : 0

      // Register guest
      const guestRecord: GuestRecord = {
        id: crypto.randomUUID(),
        memberId: selectedMember.id,
        membershipNumber: selectedMember.membershipNumber,
        guestName: guestName.trim(),
        entryTime: new Date(),
        date: new Date().toISOString().split("T")[0],
        additionalCharge,
      }

      saveGuestRecord(guestRecord)

      // Register additional charge if applicable
      if (additionalCharge > 0) {
        const charge: AdditionalCharge = {
          id: crypto.randomUUID(),
          memberId: selectedMember.id,
          membershipNumber: selectedMember.membershipNumber,
          amount: additionalCharge,
          reason: `Invitado adicional: ${guestName.trim()}`,
          date: new Date().toISOString().split("T")[0],
          paid: false,
        }

        saveAdditionalCharge(charge)
      }

      toast({
        title: "Invitado registrado",
        description: `${guestName} ha sido registrado como invitado de ${selectedMember.firstName} ${selectedMember.lastName}${
          additionalCharge > 0 ? ` - Cargo adicional: $${additionalCharge}` : ""
        }`,
      })

      // Reset form
      setGuestName("")
      setTodayGuestCount(currentGuestCount + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el invitado.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleQuickSearch = () => {
    const membershipNumber = prompt("Ingresa el número de membresía:")
    if (membershipNumber) {
      const member = findMemberByMembershipNumber(membershipNumber)
      if (member) {
        handleMemberSelect(member)
      } else {
        toast({
          title: "Miembro no encontrado",
          description: `No se encontró un miembro con el número ${membershipNumber}.`,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="heading text-2xl">Registro de Invitados</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Member Search */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="memberSearch">Buscar Miembro</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="memberSearch"
                    placeholder="Nombre, apellido o número de membresía..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleQuickSearch} variant="outline" className="bg-transparent">
                  Búsqueda Rápida
                </Button>
              </div>
            </div>

            {/* Member suggestions */}
            {searchTerm && !selectedMember && filteredMembers.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredMembers.slice(0, 5).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleMemberSelect(member)}
                    className="w-full text-left p-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {member.firstName} {member.lastName}
                      </span>
                      <Badge variant="secondary">#{member.membershipNumber}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Member Info */}
          {selectedMember && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">Membresía #{selectedMember.membershipNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Invitados hoy</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{todayGuestCount}</span>
                      <span className="text-sm text-muted-foreground">/ {GUEST_LIMIT} gratis</span>
                    </div>
                  </div>
                </div>

                {todayGuestCount >= GUEST_LIMIT && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      El siguiente invitado tendrá un cargo adicional de ${ADDITIONAL_GUEST_FEE}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Guest Registration Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Nombre del Invitado</Label>
                  <Input
                    id="guestName"
                    placeholder="Ingresa el nombre completo del invitado"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleRegisterGuest}
                  disabled={!guestName.trim() || isRegistering}
                  className="w-full flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {isRegistering ? "Registrando..." : "Registrar Invitado"}
                  {todayGuestCount >= GUEST_LIMIT && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500 text-yellow-900 rounded text-xs">
                      +${ADDITIONAL_GUEST_FEE}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
