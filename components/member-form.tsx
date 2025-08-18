"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import type { Member } from "@/lib/types"
import { saveMember, generateMembershipNumber, validatePhoneNumber, validateEmail } from "@/lib/storage"

interface MemberFormProps {
  member?: Member
  onSuccess?: () => void
  onCancel?: () => void
}

export function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    firstName: member?.firstName || "",
    lastName: member?.lastName || "",
    phone: member?.phone || "",
    email: member?.email || "",
    emergencyContactName: member?.emergencyContactName || "",
    emergencyContactPhone: member?.emergencyContactPhone || "",
    hasInsurance: member?.hasInsurance || false,
    insuranceCompany: member?.insuranceCompany || "",
    policyNumber: member?.policyNumber || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio"
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = "Formato de teléfono inválido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Formato de correo electrónico inválido"
    }

    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = "El nombre del contacto de emergencia es obligatorio"
    }

    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = "El teléfono del contacto de emergencia es obligatorio"
    } else if (!validatePhoneNumber(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = "Formato de teléfono inválido"
    }

    if (formData.hasInsurance) {
      if (!formData.insuranceCompany.trim()) {
        newErrors.insuranceCompany = "La aseguradora es obligatoria si tiene seguro"
      }
      if (!formData.policyNumber.trim()) {
        newErrors.policyNumber = "El número de póliza es obligatorio si tiene seguro"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const memberData: Member = {
        id: member?.id || crypto.randomUUID(),
        membershipNumber: member?.membershipNumber || generateMembershipNumber(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        hasInsurance: formData.hasInsurance,
        insuranceCompany: formData.hasInsurance ? formData.insuranceCompany.trim() : undefined,
        policyNumber: formData.hasInsurance ? formData.policyNumber.trim() : undefined,
        createdAt: member?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      saveMember(memberData)

      toast({
        title: member ? "Miembro actualizado" : "Miembro registrado",
        description: `${memberData.firstName} ${memberData.lastName} ha sido ${member ? "actualizado" : "registrado"} exitosamente.`,
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el miembro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="heading text-2xl">{member ? "Editar Miembro" : "Registrar Nuevo Miembro"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Ej: +1234567890"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Nombre del Contacto *</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                  placeholder="Nombre completo"
                  className={errors.emergencyContactName ? "border-destructive" : ""}
                />
                {errors.emergencyContactName && (
                  <p className="text-sm text-destructive">{errors.emergencyContactName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Teléfono del Contacto *</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                  placeholder="Ej: +1234567890"
                  className={errors.emergencyContactPhone ? "border-destructive" : ""}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-destructive">{errors.emergencyContactPhone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasInsurance"
                checked={formData.hasInsurance}
                onCheckedChange={(checked) => handleInputChange("hasInsurance", checked as boolean)}
              />
              <Label htmlFor="hasInsurance">Tiene seguro médico</Label>
            </div>

            {formData.hasInsurance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Aseguradora *</Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                    className={errors.insuranceCompany ? "border-destructive" : ""}
                  />
                  {errors.insuranceCompany && <p className="text-sm text-destructive">{errors.insuranceCompany}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Número de Póliza *</Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                    className={errors.policyNumber ? "border-destructive" : ""}
                  />
                  {errors.policyNumber && <p className="text-sm text-destructive">{errors.policyNumber}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Guardando..." : member ? "Actualizar" : "Registrar"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
