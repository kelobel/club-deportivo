"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import {
  Calendar,
  QrCode,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Check,
  X,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts"
import type { Member, AttendanceRecord } from "@/lib/types"
import {
  calculateMemberStats,
  getDateRangePresets,
  getMemberVisitTrend,
  getTodayStats,
  getCalendarData,
} from "@/lib/stats-utils"

const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#22c55e", // green-500
  "#f97316", // orange-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
]

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const formatMonth = (monthKey: string) => {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
}

export function MemberDashboard() {
  const { user } = useAuth()
  const [memberData, setMemberData] = useState<Member | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [memberCharges, setMemberCharges] = useState<any[]>([])
  const [memberMonthlyFees, setMemberMonthlyFees] = useState<any[]>([])
  const [memberStats, setMemberStats] = useState<any>(null)
  const [todayStats, setTodayStats] = useState<any>(null)
  const [visitTrend, setVisitTrend] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<string>("thisMonth")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [calendarData, setCalendarData] = useState<any[]>([])
  const [selectedDayDetails, setSelectedDayDetails] = useState<any>(null)

  const datePresets = getDateRangePresets()

  useEffect(() => {
    if (user && !user.isAdmin) {
      // Load member data
      const members = JSON.parse(localStorage.getItem("club_members") || "[]")
      const member = members.find((m: Member) => m.id === user.id)
      setMemberData(member)

      // Load attendance records
      const attendance = JSON.parse(localStorage.getItem("club_attendance") || "[]")
      const memberAttendance = attendance.filter((record: AttendanceRecord) => record.memberId === user.id)
      setAttendanceRecords(memberAttendance)

      // Load member charges
      const charges = JSON.parse(localStorage.getItem("club_charges") || "[]")
      const memberAdditionalCharges = charges.filter((charge: any) => charge.memberId === user.id)
      setMemberCharges(memberAdditionalCharges)

      // Load member monthly fees
      const monthlyFees = JSON.parse(localStorage.getItem("club_monthly_fees") || "[]")
      const memberFees = monthlyFees.filter((fee: any) => fee.memberId === user.id)
      setMemberMonthlyFees(memberFees)
    }
  }, [user])

  useEffect(() => {
    if (user && memberData) {
      updateStats()
      updateTodayStats()
      updateCalendarData()
    }
  }, [user, memberData, dateRange, customStartDate, customEndDate, calendarMonth, calendarYear])

  const updateStats = () => {
    if (!user || !memberData) return

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

    const stats = calculateMemberStats(user.id, startDate, endDate)
    setMemberStats(stats)

    const trend = getMemberVisitTrend(user.id, 30)
    setVisitTrend(trend)
  }

  const updateTodayStats = () => {
    if (!user) return
    const today = getTodayStats(user.id)
    setTodayStats(today)
  }

  const updateCalendarData = () => {
    if (!user) return
    const data = getCalendarData(user.id, calendarYear, calendarMonth)
    setCalendarData(data)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (calendarMonth === 0) {
        setCalendarMonth(11)
        setCalendarYear(calendarYear - 1)
      } else {
        setCalendarMonth(calendarMonth - 1)
      }
    } else {
      if (calendarMonth === 11) {
        setCalendarMonth(0)
        setCalendarYear(calendarYear + 1)
      } else {
        setCalendarMonth(calendarMonth + 1)
      }
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDayClick = (day: number) => {
    const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  console.log("Calendar day clicked:", day, "dateKey:", dateKey)

    const dayData = calendarData.find((d) => d.date === dateKey)
  console.log("Day data found:", dayData)

    if (dayData && dayData.visits > 0) {
      const dayRecords = attendanceRecords.filter((record) => {
        const recordDate = new Date(record.date).toISOString().split("T")[0]
        const targetDate = new Date(dateKey).toISOString().split("T")[0]
  console.log("Comparing dates:", recordDate, "vs", targetDate)
        return recordDate === targetDate
      })

  console.log("Day records found:", dayRecords)

      const allCompanions: string[] = []
      dayRecords.forEach((record) => {
        if (record.companions && Array.isArray(record.companions)) {
          allCompanions.push(...record.companions)
        }
      })

      setSelectedDayDetails({
        date: dateKey,
        formattedDate: new Date(dateKey + "T12:00:00").toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        records: dayRecords,
        companions: allCompanions,
        ...dayData,
      })
    }
  }

  if (!user || user.isAdmin || !memberData) {
    return null
  }

  const recentAttendance = attendanceRecords
    .sort((a, b) => new Date(b.entryTime || b.timestamp).getTime() - new Date(a.entryTime || a.timestamp).getTime())
    .slice(0, 5)

  const pieChartData =
    memberStats?.facilitiesUsed?.map((facility: any, index: number) => ({
      name: facility.facility,
      value: facility.visits,
      percentage: facility.percentage,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    })) || []

  const barChartData =
    memberStats?.facilitiesUsed?.map((facility: any) => ({
      facility: facility.facility.length > 10 ? facility.facility.substring(0, 10) + "..." : facility.facility,
      visits: facility.visits,
      fill: "#3b82f6",
    })) || []

  const monthlyFee = 800
  const unpaidAdditionalCharges = memberCharges.filter((charge) => !charge.paid)
  const paidAdditionalCharges = memberCharges.filter((charge) => charge.paid)
  const totalUnpaidAmount = unpaidAdditionalCharges.reduce((sum, charge) => sum + charge.amount, 0)
  const totalPaidAmount = paidAdditionalCharges.reduce((sum, charge) => sum + charge.amount, 0)

  const paidMonthlyFees = memberMonthlyFees.filter((fee) => fee.paid)
  const allPaidItems = [
    ...paidAdditionalCharges.map((charge) => ({
      ...charge,
      type: "additional",
      description: charge.reason,
      paymentDate: charge.date,
    })),
    ...paidMonthlyFees.map((fee) => ({
      ...fee,
      type: "monthly",
      description: `Mensualidad ${formatMonth(fee.month)}`,
      paymentDate: fee.dueDate, // Using dueDate as payment date for monthly fees
    })),
  ].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="heading text-xl text-green-700">Filtros de Estadísticas</CardTitle>
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

            <div className="space-y-2">
              <Label className="text-green-700">Vista</Label>
              <Button
                onClick={() => setShowCalendar(!showCalendar)}
                variant={showCalendar ? "default" : "outline"}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {showCalendar ? "Ocultar Calendario" : "Ver Calendario"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Visitas</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {memberStats?.totalVisits || attendanceRecords.length}
            </div>
            <p className="text-xs text-green-600 mt-1">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Este Mes</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{memberStats?.currentMonthVisits || 0}</div>
            <p className="text-xs text-green-600 mt-1">
              Visitas en {new Date().toLocaleDateString("es-ES", { month: "long" })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Esta Semana</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{memberStats?.currentWeekVisits || 0}</div>
            <p className="text-xs text-green-600 mt-1">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Hoy</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{todayStats?.totalVisits || 0}</div>
            <p className="text-xs text-green-600 mt-1">Visitas de hoy</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Facilidades Usadas</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{memberStats?.facilitiesUsed?.length || 0}</div>
            <p className="text-xs text-green-600 mt-1">Diferentes instalaciones</p>
          </CardContent>
        </Card>
      </div>

      {showCalendar && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="heading text-xl text-green-700">Calendario de Visitas</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium min-w-[200px] text-center">
                  {MONTHS[calendarMonth]} {calendarYear}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="text-center font-medium text-green-700 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: getFirstDayOfMonth(calendarYear, calendarMonth) }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20"></div>
              ))}

              {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, index) => {
                const day = index + 1
                const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const dayData = calendarData.find((d) => d.date === dateKey)

                return (
                  <div
                    key={day}
                    className={`h-20 border-2 border-green-200 rounded-lg p-1 relative ${
                      dayData && dayData.visits > 0 ? "cursor-pointer hover:bg-green-100 transition-colors" : ""
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="text-sm font-medium text-green-800">{day}</div>
                    {dayData && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {dayData.visits} visita{dayData.visits !== 1 ? "s" : ""}
                        </Badge>
                        {dayData.facilities.length > 0 && (
                          <div className="text-xs text-green-600 mt-1 truncate">{dayData.facilities.join(", ")}</div>
                        )}
                        {Array.isArray(dayData.companions) && dayData.companions.length > 0 && (
                          <div className="absolute top-1 right-1">
                            <Users className="h-3 w-3 text-green-600" />
                          </div>
                        )}
                        {Array.isArray(dayData.guests) && dayData.guests.length > 0 && (
                          <div className="absolute top-1 left-1">
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                              {dayData.guests.length}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDayDetails && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="heading text-xl text-blue-700">
                Detalles del {selectedDayDetails.formattedDate}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDayDetails(null)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Cerrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-blue-800 mb-3">Facilidades Visitadas</h4>
                <div className="space-y-2">
                  {selectedDayDetails.records.map((record: AttendanceRecord, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-blue-100 rounded border border-blue-200"
                    >
                      <div>
                        <span className="text-blue-700 font-medium">{record.facility}</span>
                        <div className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(record.entryTime || record.timestamp).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {Array.isArray(selectedDayDetails.companions) && selectedDayDetails.companions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-3">Acompañantes del Día</h4>
                  <div className="p-3 bg-blue-100 rounded border border-blue-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-blue-700">
                        {selectedDayDetails.companions.length} acompañante
                        {selectedDayDetails.companions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-sm text-blue-600">{selectedDayDetails.companions.join(", ")}</div>
                  </div>
                </div>
              )}

              {Array.isArray(selectedDayDetails.guests) && selectedDayDetails.guests.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-3">Invitados del Día</h4>
                  <div className="p-3 bg-green-100 rounded border border-green-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-green-700">
                        {selectedDayDetails.guests.length} invitado
                        {selectedDayDetails.guests.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-sm text-green-600">{selectedDayDetails.guests.join(", ")}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Total de visitas del día:</span>
                <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                  {selectedDayDetails.visits}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      labelLine={false}
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
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
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
                    color: "#3b82f6",
                  },
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="facility" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="visits" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
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
        <CardContent className="p-2 sm:p-6">
          <div className="w-full overflow-hidden">
            {visitTrend.length > 0 ? (
              <ChartContainer
                config={{
                  visits: {
                    label: "Visitas",
                    color: "#3b82f6",
                  },
                }}
                className="h-[150px] sm:h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitTrend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="formattedDate" fontSize={10} interval="preserveStartEnd" />
                    <YAxis fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 1, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[150px] sm:h-[200px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Member Charges */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="heading text-xl text-blue-700 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Mis Cargos
          </CardTitle>
          <CardDescription>Mensualidad y cargos adicionales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Monthly Fee */}
            <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-blue-800">Mensualidad</h3>
                  <p className="text-sm text-blue-600">Cuota mensual del club</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-700">${monthlyFee}</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Mensual
                  </Badge>
                </div>
              </div>
            </div>

            {/* Additional Charges */}
            {memberCharges.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">Cargos Adicionales</h3>
                <div className="space-y-3">
                  {memberCharges
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((charge) => (
                      <div
                        key={charge.id}
                        className={`p-3 border rounded-lg ${
                          charge.paid ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{charge.reason}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(charge.date).toLocaleDateString("es-ES", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-lg font-bold">${charge.amount}</p>
                            </div>
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
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Charges Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200">
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-600">Mensualidad</p>
                <p className="text-xl font-bold text-blue-800">${monthlyFee}</p>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-600">Cargos Pendientes</p>
                <p className="text-xl font-bold text-yellow-800">${totalUnpaidAmount}</p>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-600">Total Pagado</p>
                <p className="text-xl font-bold text-green-800">${totalPaidAmount}</p>
              </div>
            </div>

            {memberCharges.length === 0 && (
              <div className="text-center py-6 text-blue-600">
                <p>No tienes cargos adicionales registrados.</p>
                <p className="text-sm text-blue-500 mt-1">Solo tienes la mensualidad regular de ${monthlyFee}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {allPaidItems.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="heading text-xl text-green-700 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
            <CardDescription>Registro completo de todos tus pagos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allPaidItems.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}-${index}`}
                  className="flex items-center justify-between p-4 border-2 border-green-200 rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      {item.type === "monthly" ? (
                        <Calendar className="h-5 w-5 text-green-600" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{item.description}</p>
                      <p className="text-sm text-green-600">
                        {new Date(item.paymentDate).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                        {item.type === "monthly" ? "Mensualidad" : "Cargo Adicional"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-700">${item.amount}</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="h-3 w-3" />
                      Pagado
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-100 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">Total de pagos realizados:</span>
                <span className="text-2xl font-bold text-green-700">
                  ${allPaidItems.reduce((sum, item) => sum + item.amount, 0)}
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {allPaidItems.length} pago{allPaidItems.length !== 1 ? "s" : ""} registrado
                {allPaidItems.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Data and QR Code */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Mis Datos</CardTitle>
            <CardDescription>Información personal del miembro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-green-700">Nombre Completo</label>
                <p className="text-sm">{`${memberData.firstName} ${memberData.lastName}`}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-green-700">Email</label>
                <p className="text-sm">{memberData.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-green-700">Teléfono</label>
                <p className="text-sm">{memberData.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-green-700">Número de Membresía</label>
                <p className="text-sm font-mono bg-green-100 px-2 py-1 rounded border-2 border-green-300">
                  {memberData.membershipNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-green-700">Fecha de Registro</label>
                <p className="text-sm">{new Date(memberData.createdAt).toLocaleDateString("es-ES")}</p>
              </div>
              {memberData.emergencyContactName && (
                <div>
                  <label className="text-sm font-medium text-green-700">Contacto de Emergencia</label>
                  <p className="text-sm">{memberData.emergencyContactName}</p>
                  {memberData.emergencyContactPhone && (
                    <p className="text-xs text-muted-foreground">{memberData.emergencyContactPhone}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Mi Código QR
            </CardTitle>
            <CardDescription>Usa este código para registrar tu asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="inline-block bg-green-100 border-2 border-green-300 rounded-lg p-6">
                <p className="text-3xl font-mono font-bold text-green-800">{memberData.membershipNumber}</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">Presenta este código al registrar en el club</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentAttendance.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Historial Reciente</CardTitle>
            <CardDescription>Últimas 5 visitas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border-2 border-green-200 rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{record.facility || "Entrada General"}</p>
                      <p className="text-sm text-green-600">
                        {new Date(record.entryTime || record.timestamp).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {record.companions && Array.isArray(record.companions) && record.companions.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">
                            Con {record.companions.length} acompañante{record.companions.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-green-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(record.entryTime || record.timestamp).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
