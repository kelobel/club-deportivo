"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, DollarSign, Check, X, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { AdditionalCharge, Member } from "@/lib/types"
import { getAdditionalCharges, getMembers } from "@/lib/storage"

interface MonthlyFee {
  id: string
  memberId: string
  membershipNumber: string
  month: string // YYYY-MM format
  amount: number
  paid: boolean
  dueDate: string
}

export function ChargesManagement() {
  const [charges, setCharges] = useState<AdditionalCharge[]>([])
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [filteredCharges, setFilteredCharges] = useState<AdditionalCharge[]>([])
  const [filteredMonthlyFees, setFilteredMonthlyFees] = useState<MonthlyFee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(true)
  const [viewType, setViewType] = useState<"all" | "monthly" | "additional">("all")

  const loadCharges = () => {
    const allCharges = getAdditionalCharges()
    const membersList = getMembers()

    // Sort by most recent first
    const sortedCharges = allCharges.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setCharges(sortedCharges)
    setMembers(membersList)

    // Generate monthly fees for current and previous months
    generateMonthlyFees(membersList)
  }

  const generateMonthlyFees = (membersList: Member[]) => {
    const existingFees = JSON.parse(localStorage.getItem("club_monthly_fees") || "[]")
    const newFees: MonthlyFee[] = [...existingFees] // Mantener las existentes

    membersList.forEach((member) => {
      const registrationDate = new Date(member.registrationDate)
      const currentDate = new Date()

      // Generar mensualidades desde el mes de registro hasta el mes actual
      const startMonth = new Date(registrationDate.getFullYear(), registrationDate.getMonth(), 1)
      const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      const monthsToGenerate = []
      const tempDate = new Date(startMonth)

      while (tempDate <= endMonth) {
        monthsToGenerate.push({
          key: `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}`,
          year: tempDate.getFullYear(),
          month: tempDate.getMonth(),
        })
        tempDate.setMonth(tempDate.getMonth() + 1)
      }

      monthsToGenerate.forEach((monthData) => {
        const existingFee = newFees.find((fee: MonthlyFee) => fee.memberId === member.id && fee.month === monthData.key)

        if (!existingFee) {
          // Crear nueva mensualidad solo si no existe
          // La fecha de vencimiento es el día de registro del mes correspondiente
          const dueDate = new Date(monthData.year, monthData.month, registrationDate.getDate())

          newFees.push({
            id: `${member.id}-${monthData.key}`,
            memberId: member.id,
            membershipNumber: member.membershipNumber,
            month: monthData.key,
            amount: 800,
            paid: false,
            dueDate: dueDate.toISOString().split("T")[0],
          })
        }
      })
    })

    // Save to localStorage
    localStorage.setItem("club_monthly_fees", JSON.stringify(newFees))
    setMonthlyFees(newFees.sort((a, b) => b.month.localeCompare(a.month)))
  }

  useEffect(() => {
    loadCharges()
  }, [])

  useEffect(() => {
    let filteredAdditional = charges
    let filteredMonthly = monthlyFees

    if (showOnlyUnpaid) {
      filteredAdditional = filteredAdditional.filter((charge) => !charge.paid)
      filteredMonthly = filteredMonthly.filter((fee) => !fee.paid)
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()

      filteredAdditional = filteredAdditional.filter((charge) => {
        const member = members.find((m) => m.id === charge.memberId)
        return (
          charge.membershipNumber.includes(searchTerm) ||
          charge.reason.toLowerCase().includes(searchLower) ||
          (member &&
            (member.firstName.toLowerCase().includes(searchLower) ||
              member.lastName.toLowerCase().includes(searchLower)))
        )
      })

      filteredMonthly = filteredMonthly.filter((fee) => {
        const member = members.find((m) => m.id === fee.memberId)
        return (
          fee.membershipNumber.includes(searchTerm) ||
          (member &&
            (member.firstName.toLowerCase().includes(searchLower) ||
              member.lastName.toLowerCase().includes(searchLower)))
        )
      })
    }

    setFilteredCharges(filteredAdditional)
    setFilteredMonthlyFees(filteredMonthly)
  }, [charges, monthlyFees, searchTerm, showOnlyUnpaid, members])

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    return member ? `${member.firstName} ${member.lastName}` : "Miembro no encontrado"
  }

  const handleMarkAsPaid = (chargeId: string) => {
    const updatedCharges = charges.map((charge) => (charge.id === chargeId ? { ...charge, paid: true } : charge))
    setCharges(updatedCharges)
    localStorage.setItem("club_charges", JSON.stringify(updatedCharges))

    toast({
      title: "Cargo marcado como pagado",
      description: "El cargo adicional ha sido marcado como pagado exitosamente.",
    })
  }

  const handleMarkMonthlyAsPaid = (feeId: string) => {
    const updatedFees = monthlyFees.map((fee) => (fee.id === feeId ? { ...fee, paid: true } : fee))
    setMonthlyFees(updatedFees)
    localStorage.setItem("club_monthly_fees", JSON.stringify(updatedFees))

    toast({
      title: "Mensualidad marcada como pagada",
      description: "La mensualidad ha sido marcada como pagada exitosamente.",
    })
  }

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const totalUnpaidAdditional = charges.filter((charge) => !charge.paid).reduce((sum, charge) => sum + charge.amount, 0)
  const totalPaidAdditional = charges.filter((charge) => charge.paid).reduce((sum, charge) => sum + charge.amount, 0)
  const totalUnpaidMonthly = monthlyFees.filter((fee) => !fee.paid).reduce((sum, fee) => sum + fee.amount, 0)
  const totalPaidMonthly = monthlyFees.filter((fee) => fee.paid).reduce((sum, fee) => sum + fee.amount, 0)

  const shouldShowAdditional = viewType === "all" || viewType === "additional"
  const shouldShowMonthly = viewType === "all" || viewType === "monthly"

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensualidades Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">${totalUnpaidMonthly}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cargos Adicionales Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">${totalUnpaidAdditional}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensualidades Cobradas</p>
                <p className="text-2xl font-bold text-green-600">${totalPaidMonthly}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cargos Adicionales Cobrados</p>
                <p className="text-2xl font-bold text-green-600">${totalPaidAdditional}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charges Management */}
      <Card>
        <CardHeader>
          <CardTitle className="heading text-2xl">Gestión de Cargos y Mensualidades</CardTitle>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por miembro o número de membresía..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={viewType} onValueChange={(value: "all" | "monthly" | "additional") => setViewType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cargos</SelectItem>
                <SelectItem value="monthly">Solo mensualidades</SelectItem>
                <SelectItem value="additional">Solo cargos adicionales</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOnlyUnpaid"
                checked={showOnlyUnpaid}
                onCheckedChange={(checked) => setShowOnlyUnpaid(checked as boolean)}
              />
              <label htmlFor="showOnlyUnpaid" className="text-sm font-medium">
                Solo pendientes
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Monthly Fees Section */}
            {shouldShowMonthly && (
              <div>
                <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mensualidades
                </h3>
                {filteredMonthlyFees.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {searchTerm || showOnlyUnpaid
                      ? "No se encontraron mensualidades que coincidan con los filtros."
                      : "No hay mensualidades registradas."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMonthlyFees.map((fee) => (
                      <div
                        key={fee.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          fee.paid ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{getMemberName(fee.memberId)}</h4>
                              <Badge variant="secondary">#{fee.membershipNumber}</Badge>
                              <Badge variant={fee.paid ? "default" : "outline"} className="flex items-center gap-1">
                                {fee.paid ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Pagado
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3" />
                                    Pendiente
                                  </>
                                )}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                <strong>Período:</strong> {formatMonth(fee.month)}
                              </p>
                              <p>
                                <strong>Vencimiento:</strong> {new Date(fee.dueDate).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Mensualidad</p>
                              <p className="text-xl font-bold">${fee.amount}</p>
                            </div>

                            {!fee.paid && (
                              <Button
                                onClick={() => handleMarkMonthlyAsPaid(fee.id)}
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Marcar Pagado
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Additional Charges Section */}
            {shouldShowAdditional && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cargos Adicionales
                </h3>
                {filteredCharges.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {searchTerm || showOnlyUnpaid
                      ? "No se encontraron cargos adicionales que coincidan con los filtros."
                      : "No hay cargos adicionales registrados."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCharges.map((charge) => (
                      <div
                        key={charge.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          charge.paid ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{getMemberName(charge.memberId)}</h4>
                              <Badge variant="secondary">#{charge.membershipNumber}</Badge>
                              <Badge variant={charge.paid ? "default" : "outline"} className="flex items-center gap-1">
                                {charge.paid ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Pagado
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3" />
                                    Pendiente
                                  </>
                                )}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                <strong>Motivo:</strong> {charge.reason}
                              </p>
                              <p>
                                <strong>Fecha:</strong>{" "}
                                {new Date(charge.date).toLocaleDateString("es-ES", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Monto</p>
                              <p className="text-xl font-bold">${charge.amount}</p>
                            </div>

                            {!charge.paid && (
                              <Button
                                onClick={() => handleMarkAsPaid(charge.id)}
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Marcar Pagado
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {(filteredCharges.length > 0 || filteredMonthlyFees.length > 0) && (
            <div className="mt-6 text-sm text-muted-foreground text-center border-t pt-4">
              Mostrando {filteredMonthlyFees.length} mensualidades y {filteredCharges.length} cargos adicionales
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
