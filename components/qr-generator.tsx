"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import type { Member } from "@/lib/types"
import { generateQRCodeURL } from "@/lib/qr-utils"

interface QRGeneratorProps {
  member: Member
  onBack?: () => void // Added onBack prop for navigation
}

export function QRGenerator({ member, onBack }: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    const url = generateQRCodeURL(member.membershipNumber)
    setQrCodeUrl(url)
  }, [member.membershipNumber])

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `QR_${member.firstName}_${member.lastName}_${member.membershipNumber}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        {onBack && (
          <div className="flex justify-start mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        )}
        <CardTitle className="heading text-xl text-center">Código QR de Acceso</CardTitle>
        <div className="text-center space-y-1">
          <p className="font-semibold">
            {member.firstName} {member.lastName}
          </p>
          <p className="text-sm text-muted-foreground">Membresía #{member.membershipNumber}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {qrCodeUrl ? (
            <img src={qrCodeUrl || "/placeholder.svg"} alt="Código QR" className="w-48 h-48 border rounded-lg" />
          ) : (
            <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Generando QR...</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button onClick={handleDownload} disabled={!qrCodeUrl} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Descargar QR
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Escanea este código para registrar tu entrada al club</p>
        </div>
      </CardContent>
    </Card>
  )
}
