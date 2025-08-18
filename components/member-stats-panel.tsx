"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, TrendingUp, MapPin, Clock, BarChart3 } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts"
import type { Member, MemberStats } from "@/lib/types"
import { getMembers } from "@/lib/storage"
import { calculateMemberStats, getDateRangePresets, getMemberVisitTrend } from "@/lib/stats-utils"

const CHART_COLORS = [
  "#22c55e", // green-500
  "#16a34a", // green-600
  "#15803d", // green-700
  "#166534", // green-800
  "#14532d", // green-900
]

export function MemberStatsPanel() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null)
  const [visitTrend, setVisitTrend] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<string>("thisMonth")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const datePresets = getDateRangePresets()

  useEffect(() => {
    setMembers(getMembers())
  }, [])

  useEffect(() => {
    if (selectedMember) {
      updateStats()
    }
  }, [selectedMember, dateRange, customStartDate, customEndDate])

  const updateStats = () => {
    if (!selectedMember) return

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (dateRange === "custom") {
      startDate = customStartDate ? new Date(customStartDate) : undefined
      endDate = customEndDate ? new Date(customEndDate) : undefined
    } else if (dateRange !== "all") {
      const preset = datePresets[dateRange as keyof typeof datePresets]
      startDate = preset.start
      endDate = preset.end
    }

    const stats = calculateMemberStats(selectedMember.id, startDate, endDate)
    setMemberStats(stats)

    // Get visit trend for the last 30 days
    const trend = getMemberVisitTrend(selectedMember.id, 30)
    setVisitTrend(trend)
  }

  const handleMemberSelect = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    setSelectedMember(member || null)
  }

  const pieChartData = memberStats?.facilitiesUsed.map((facility, index) => ({
    name: facility.facility,
    value: facility.visits,
    percentage: facility.percentage,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const barChartData = memberStats?.facilitiesUsed.map((facility) => ({
    facility: facility.facility.length > 10 ? facility.facility.substring(0, 10) + "..." : facility.facility,
    visits: facility.visits,
    fill: "#22c55e",
  }))

  return (
    <div className="space-y-6">
      {/* Member Selection and Date Range */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="heading text-2xl text-green-700">
                Estadísticas de {selectedMember?.firstName} {selectedMember?.lastName}
              </CardTitle>
              <p className="text-muted-foreground">Membresía #{selectedMember?.membershipNumber}</p>
            </div>
            <Button
              onClick={() => setSelectedMember(null)}
              variant="outline"
              className="bg-transparent border-green-300 text-green-700 hover:bg-green-50"
            >
              Cambiar Miembro
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-green-700">Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="border-green-300 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                  <SelectItem value="thisWeek">Esta semana</SelectItem>
                  <SelectItem value="thisMonth">Este mes</SelectItem>
                  <SelectItem value="last30Days">Últimos 30 días</SelectItem>
                  <SelectItem value="last3Months">Últimos 3 meses</SelectItem>
                  <SelectItem value="thisYear">Este año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label className="text-green-700">Fecha Inicio</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-green-700">Fecha Fin</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Visitas</p>
                <p className="text-2xl font-bold text-green-800">{memberStats?.totalVisits}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Este Mes</p>
                <p className="text-2xl font-bold text-green-800">{memberStats?.currentMonthVisits}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Esta Semana</p>
                <p className="text-2xl font-bold text-green-800">{memberStats?.currentWeekVisits}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Facilidades Usadas</p>
                <p className="text-2xl font-bold text-green-800">{memberStats?.facilitiesUsed.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Facility Usage */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="heading text-xl text-green-700">Uso por Facilidad</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData?.length > 0 ? (
              <ChartContainer
                config={{
                  visits: {
                    label: "Visitas",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Facility Visits */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="heading text-xl text-green-700">Visitas por Facilidad</CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData?.length > 0 ? (
              <ChartContainer
                config={{
                  visits: {
                    label: "Visitas",
                    color: "#22c55e",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="facility" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="visits" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visit Trend */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="heading text-xl text-green-700">Tendencia de Visitas (Últimos 30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {visitTrend.length > 0 ? (
            <ChartContainer
              config={{
                visits: {
                  label: "Visitas",
                  color: "#22c55e",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitTrend}>
                  <XAxis dataKey="formattedDate" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No hay datos para mostrar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Facility Stats */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="heading text-xl text-green-700">Detalle por Facilidad</CardTitle>
        </CardHeader>
        <CardContent>
          {memberStats?.facilitiesUsed.length > 0 ? (
            <div className="space-y-4">
              {memberStats.facilitiesUsed.map((facility, index) => (
                <div
                  key={facility.facility}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-2 border-green-200 rounded-lg bg-green-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-green-800">{facility.facility}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-300">
                        {facility.percentage}% del total
                      </Badge>
                    </div>
                    <div className="text-sm text-green-600 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {facility.visits} visitas
                      </span>
                      {facility.lastVisit && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Última: {new Date(facility.lastVisit).toLocaleDateString("es-ES")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold border-2 border-green-300"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    >
                      {facility.visits}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros de visitas para el período seleccionado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
