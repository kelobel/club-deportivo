"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, MapPin } from "lucide-react"
import type { AttendanceRecord, Member } from "@/lib/types"
import { getAttendanceRecords, getMembers } from "@/lib/storage"

export function AttendanceHistory() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const records = getAttendanceRecords()
    const membersList = getMembers()

    // Sort by most recent first
    const sortedRecords = records.sort((a, b) => {
      const timeA = a.type === 'entry' ? new Date(a.entryTime).getTime() : new Date(a.exitTime || a.entryTime).getTime()
      const timeB = b.type === 'entry' ? new Date(b.entryTime).getTime() : new Date(b.exitTime || b.entryTime).getTime()
      return timeB - timeA
    })

    setAttendanceRecords(sortedRecords)
    setMembers(membersList)
    setFilteredRecords(sortedRecords)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(attendanceRecords)
      return
    }

    const filtered = attendanceRecords.filter((record) => {
      const member = members.find((m) => m.id === record.memberId)
      const searchLower = searchTerm.toLowerCase()

      return (
        record.membershipNumber.includes(searchTerm) ||
        record.facility.toLowerCase().includes(searchLower) ||
        (member &&
          (member.firstName.toLowerCase().includes(searchLower) || member.lastName.toLowerCase().includes(searchLower)))
      )
    })

    setFilteredRecords(filtered)
  }, [searchTerm, attendanceRecords, members])

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    return member ? `${member.firstName} ${member.lastName}` : "Miembro no encontrado"
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="heading text-2xl">Historial de Asistencia</CardTitle>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, número de membresía o facilidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm
              ? "No se encontraron registros que coincidan con la búsqueda."
              : "No hay registros de asistencia."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold">{getMemberName(record.memberId)}</h3>
                    <Badge variant="secondary">#{record.membershipNumber}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {record.facility}
                    </Badge>
                    <Badge className={`flex items-center gap-1 ${
                      record.type === 'entry' 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {record.type === 'entry' ? '📥 Entrada' : '📤 Salida'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {record.type === 'entry' ? 'Entrada: ' : 'Salida: '}
                      {formatTime(record.type === 'entry' ? record.entryTime : (record.exitTime || record.entryTime))}
                    </div>
                    <span>{formatDate(record.type === 'entry' ? record.entryTime : (record.exitTime || record.entryTime))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRecords.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando {filteredRecords.length} de {attendanceRecords.length} registros
          </div>
        )}
      </CardContent>
    </Card>
  )
}
