"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import type { Member } from "@/lib/types"
import { generateQRCodeURL } from "@/lib/qr-utils"
import { useToast } from "@/hooks/use-toast"

interface QRGeneratorProps {
  member: Member
  onBack?: () => void // Added onBack prop for navigation
}

export function QRGenerator({ member, onBack }: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const url = generateQRCodeURL(member.membershipNumber)
    setQrCodeUrl(url)
  }, [member.membershipNumber])

  const handleDownload = async () => {
    if (!qrCodeUrl) return
    
    setIsDownloading(true)
    try {
      // Fetch the image as blob
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `QR_${member.firstName}_${member.lastName}_${member.membershipNumber}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl)
      
      toast({
        title: "✅ QR descargado",
        description: `Código QR de ${member.firstName} ${member.lastName} descargado exitosamente`,
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "❌ Error al descargar",
        description: "No se pudo descargar el código QR. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
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
          <Button 
            onClick={handleDownload} 
            disabled={!qrCodeUrl || isDownloading} 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Descargando..." : "Descargar QR"}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Escanea este código para registrar tu entrada al club</p>
        </div>
      </CardContent>
    </Card>
  )
}
