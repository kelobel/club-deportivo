"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Facility } from "@/lib/types"
import { findMemberByMembershipNumber, saveAttendanceRecord } from "@/lib/storage"
import { useAuth } from "@/hooks/use-auth"

const FACILITIES: Facility[] = [
  "Gimnasio",
  "Piscina",
  "Cancha de baloncesto",
  "Cancha de tenis",
  "Cafetería",
  "Sauna",
  "Área de spinning",
]

interface QRScannerProps {
  onScanSuccess?: (membershipNumber: string, facility: Facility) => void
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  console.log("QR Scanner - User:", user)
  console.log("QR Scanner - Is Admin:", isAdmin)

  const [selectedFacility, setSelectedFacility] = useState<Facility | "">("")
  const [manualMemberCode, setManualMemberCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleManualInput = () => {
    if (!selectedFacility) {
      toast({
        title: "Selecciona una facilidad",
        description: "Debes seleccionar la facilidad antes de registrar entrada.",
        variant: "destructive",
      })
      return
    }

    if (!manualMemberCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Ingresa el código de miembro.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    const membershipNumber = manualMemberCode.trim()
    const member = findMemberByMembershipNumber(membershipNumber)

    if (!member) {
      toast({
        title: "Miembro no encontrado",
        description: `No se encontró un miembro con el código ${membershipNumber}.`,
        variant: "destructive",
      })
      setIsProcessing(false)
      return
    }

    const attendanceRecord = {
      id: crypto.randomUUID(),
      memberId: member.id,
      membershipNumber: member.membershipNumber,
      memberName: `${member.firstName} ${member.lastName}`,
      facility: selectedFacility as Facility,
      entryTime: new Date(),
      date: new Date().toISOString().split("T")[0],
    }

    try {
      saveAttendanceRecord(attendanceRecord)

      toast({
        title: "✅ Entrada registrada",
        description: `${member.firstName} ${member.lastName} - ${selectedFacility}`,
      })

      onScanSuccess?.(membershipNumber, selectedFacility as Facility)
      setManualMemberCode("")

      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    } catch (error) {
  console.error("Error saving attendance:", error)
      toast({
        title: "Error al registrar",
        description: "No se pudo guardar el registro de entrada.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="heading text-xl text-center flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            Registro de Entrada Manual
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Facilidad *</Label>
            <Select value={selectedFacility} onValueChange={(value) => setSelectedFacility(value as Facility)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la facilidad" />
              </SelectTrigger>
              <SelectContent>
                {FACILITIES.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberCode">Código de Miembro</Label>
              <Input
                id="memberCode"
                type="text"
                placeholder="Ej: 000001"
                value={manualMemberCode}
                onChange={(e) => setManualMemberCode(e.target.value)}
                disabled={isProcessing}
                className="text-center text-lg font-mono"
              />
              <p className="text-xs text-muted-foreground text-center">Ingresa el número de membresía (6 dígitos)</p>
            </div>

            <Button
              onClick={handleManualInput}
              disabled={!selectedFacility || !manualMemberCode.trim() || isProcessing}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isProcessing ? "Procesando..." : "Registrar Entrada"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
