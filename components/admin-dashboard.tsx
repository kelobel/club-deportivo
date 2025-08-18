"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  MapPin,
  UserPlus,
  QrCode,
  UserCheck,
  CreditCard,
  RefreshCw,
  Clock,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { DashboardStats } from "@/lib/types"
import { calculateDashboardStats, getRecentActivity, getVisitTrend, getMembershipGrowth } from "@/lib/dashboard-utils"
import { calculateGlobalStats } from "@/lib/stats-utils"

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

interface AdminDashboardProps {
  onNavigateToSection?: (section: string) => void
}

export function AdminDashboard({ onNavigateToSection }: AdminDashboardProps) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [globalStats, setGlobalStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [visitTrend, setVisitTrend] = useState<any[]>([])
  const [membershipGrowth, setMembershipGrowth] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const loadDashboardData = () => {
    const stats = calculateDashboardStats()
    const global = calculateGlobalStats()
    const activity = getRecentActivity(8)
    const trend = getVisitTrend(30)
    const growth = getMembershipGrowth(6)

  console.log("Global stats calculated:", global)
  console.log("Facilities used:", global?.facilitiesUsed)
  console.log("Visit trend:", global?.visitTrend)

    setDashboardStats(stats)
    setGlobalStats(global)
    setRecentActivity(activity)
    setVisitTrend(trend)
    setMembershipGrowth(growth)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  const facilityChartData =
    globalStats?.facilitiesUsed && globalStats.facilitiesUsed.length > 0
      ? globalStats.facilitiesUsed.map((facility: any, index: number) => ({
          name: facility.facility,
          visits: facility.visits,
          percentage: facility.percentage,
          fill: CHART_COLORS[index % CHART_COLORS.length],
        }))
      : []

  const trendData = globalStats?.visitTrend && globalStats.visitTrend.length > 0 ? globalStats.visitTrend : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading text-3xl text-primary">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Última actualización: {lastUpdated.toLocaleTimeString("es-ES")}</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" className="flex items-center gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Miembros</p>
                <p className="text-2xl font-bold text-green-800">{dashboardStats.totalMembers}</p>
                <p className="text-xs text-green-600">{dashboardStats.activeMembers} activos (últimos 30 días)</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Visitas Totales</p>
                <p className="text-2xl font-bold text-green-800">
                  {globalStats?.totalVisits || dashboardStats.todayVisits}
                </p>
                <p className="text-xs text-green-600">Registros de asistencia</p>
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
                <p className="text-sm text-green-600 font-medium">Ingresos por Invitados</p>
                <p className="text-2xl font-bold text-green-800">${dashboardStats.revenueFromGuests}</p>
                <p className="text-xs text-green-600">Total acumulado</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Miembros Únicos</p>
                <p className="text-2xl font-bold text-green-800">
                  {globalStats?.uniqueMembers || dashboardStats.activeMembers}
                </p>
                <p className="text-xs text-green-600">Con visitas registradas</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="heading text-xl text-green-700">Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Button
              onClick={() => onNavigateToSection?.("members")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 bg-transparent border-green-300 text-green-700 hover:bg-green-100/50 hover:border-green-400 hover:text-green-700 transition-all duration-200"
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-xs">Agregar Miembro</span>
            </Button>

            <Button
              onClick={() => onNavigateToSection?.("scanner")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 bg-transparent border-green-300 text-green-700 hover:bg-green-100/50 hover:border-green-400 hover:text-green-700 transition-all duration-200"
            >
              <QrCode className="h-6 w-6" />
              <span className="text-xs">Registro Manual</span>
            </Button>

            <Button
              onClick={() => onNavigateToSection?.("guests")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 bg-transparent border-green-300 text-green-700 hover:bg-green-100/50 hover:border-green-400 hover:text-green-700 transition-all duration-200"
            >
              <UserCheck className="h-6 w-6" />
              <span className="text-xs">Registrar Invitado</span>
            </Button>

            <Button
              onClick={() => onNavigateToSection?.("guest-status")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 bg-transparent border-green-300 text-green-700 hover:bg-green-100/50 hover:border-green-400 hover:text-green-700 transition-all duration-200"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs">Estado Invitados</span>
            </Button>

            <Button
              onClick={() => onNavigateToSection?.("charges")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 bg-transparent border-green-300 text-green-700 hover:bg-green-100/50 hover:border-green-400 hover:text-green-700 transition-all duration-200"
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-xs">Gestionar Cargos</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Trend */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="heading text-xl text-green-700">Tendencia de Visitas (30 días)</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="w-full overflow-hidden">
              {trendData.length > 0 ? (
                <ChartContainer
                  config={{
                    visits: {
                      label: "Visitas",
                      color: "#22c55e",
                    },
                  }}
                  className="h-[200px] sm:h-[250px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <XAxis dataKey="formattedDate" fontSize={10} interval="preserveStartEnd" />
                      <YAxis fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="visits"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: "#22c55e", strokeWidth: 1, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-muted-foreground">
                  No hay datos para mostrar
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Facilities */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="heading text-xl text-green-700">Facilidades Más Populares</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="w-full overflow-hidden">
              {facilityChartData.length > 0 ? (
                <ChartContainer
                  config={{
                    visits: {
                      label: "Visitas",
                    },
                  }}
                  className="h-[200px] sm:h-[250px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Pie
                        data={facilityChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="visits"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {facilityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-muted-foreground">
                  No hay datos para mostrar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="heading text-xl">Crecimiento de Membresías (6 meses)</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="w-full overflow-hidden">
            <ChartContainer
              config={{
                newMembers: {
                  label: "Nuevos Miembros",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-[150px] sm:h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membershipGrowth} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis dataKey="formattedMonth" fontSize={10} />
                  <YAxis fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="newMembers" fill="var(--color-newMembers)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="heading text-xl">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === "attendance" ? (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-accent" />
                      </div>
                    )}

                    <div>
                      <p className="font-medium">
                        {activity.memberName} <Badge variant="secondary">#{activity.membershipNumber}</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type === "attendance" ? (
                          <>Ingresó a {activity.facility}</>
                        ) : (
                          <>
                            Registró invitado: {activity.guestName}
                            {activity.additionalCharge > 0 && (
                              <span className="ml-2 text-yellow-600">+${activity.additionalCharge}</span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div>
                      {activity.time.toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay actividad reciente.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
