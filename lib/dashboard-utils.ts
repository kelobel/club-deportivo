import type { DashboardStats, FacilityStats } from "./types"
import { getMembers, getAttendanceRecords, getGuestRecords, getAdditionalCharges } from "./storage"

export const calculateDashboardStats = (): DashboardStats => {
  const members = getMembers()
  const attendanceRecords = getAttendanceRecords()
  const guestRecords = getGuestRecords()
  const additionalCharges = getAdditionalCharges()

  const today = new Date().toISOString().split("T")[0]
  const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM

  // Basic counts
  const totalMembers = members.length

  // Today's visits
  const todayVisits = attendanceRecords.filter((record) => record.date === today).length

  // Monthly visits
  const monthlyVisits = attendanceRecords.filter((record) => record.date.startsWith(currentMonth)).length

  // Popular facilities
  const facilityUsage = new Map<string, number>()
  attendanceRecords.forEach((record) => {
    const count = facilityUsage.get(record.facility) || 0
    facilityUsage.set(record.facility, count + 1)
  })

  const popularFacilities: FacilityStats[] = Array.from(facilityUsage.entries())
    .map(([facility, visits]) => ({
      facility: facility as any,
      visits,
      percentage: attendanceRecords.length > 0 ? Math.round((visits / attendanceRecords.length) * 100) : 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)

  // Revenue from guests
  const revenueFromGuests = guestRecords.reduce((sum, record) => sum + record.additionalCharge, 0)

  // Active members (visited in the last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

  const activeMemberIds = new Set(
    attendanceRecords.filter((record) => record.date >= thirtyDaysAgoStr).map((record) => record.memberId),
  )
  const activeMembers = activeMemberIds.size

  return {
    totalMembers,
    todayVisits,
    monthlyVisits,
    popularFacilities,
    revenueFromGuests,
    activeMembers,
  }
}

export const getRecentActivity = (limit = 10) => {
  const attendanceRecords = getAttendanceRecords()
  const guestRecords = getGuestRecords()
  const members = getMembers()

  const activities: Array<{
    id: string
    type: "attendance" | "guest"
    memberName: string
    membershipNumber: string
    facility?: string
    guestName?: string
    time: Date
    additionalCharge?: number
    entryType?: 'entry' | 'exit'
  }> = []

  // Add attendance records
  attendanceRecords.forEach((record) => {
    const member = members.find((m) => m.id === record.memberId)
    if (member) {
      activities.push({
        id: record.id,
        type: "attendance",
        memberName: `${member.firstName} ${member.lastName}`,
        membershipNumber: record.membershipNumber,
        facility: record.facility,
        time: new Date(record.type === 'entry' ? record.entryTime : (record.exitTime || record.entryTime)),
        entryType: record.type,
      })
    }
  })

  // Add guest records
  guestRecords.forEach((record) => {
    const member = members.find((m) => m.id === record.memberId)
    if (member) {
      activities.push({
        id: record.id,
        type: "guest",
        memberName: `${member.firstName} ${member.lastName}`,
        membershipNumber: record.membershipNumber,
        guestName: record.guestName,
        time: new Date(record.entryTime),
        additionalCharge: record.additionalCharge,
      })
    }
  })

  // Sort by most recent and limit
  return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, limit)
}

export const getVisitTrend = (days = 30) => {
  const attendanceRecords = getAttendanceRecords()
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const dailyVisits = new Map<string, number>()

  // Initialize all days with 0 visits
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dateKey = date.toISOString().split("T")[0]
    dailyVisits.set(dateKey, 0)
  }

  // Count actual visits
  attendanceRecords
    .filter((record) => new Date(record.entryTime) >= startDate)
    .forEach((record) => {
      const dateKey = record.date
      const count = dailyVisits.get(dateKey) || 0
      dailyVisits.set(dateKey, count + 1)
    })

  return Array.from(dailyVisits.entries())
    .map(([date, visits]) => ({
      date,
      visits,
      formattedDate: new Date(date).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export const getMembershipGrowth = (months = 12) => {
  const members = getMembers()
  const now = new Date()

  const monthlyGrowth = new Map<string, number>()

  // Initialize months
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM
    monthlyGrowth.set(monthKey, 0)
  }

  // Count new members by month
  members.forEach((member) => {
    const createdDate = new Date(member.createdAt)
    const monthKey = createdDate.toISOString().substring(0, 7)
    if (monthlyGrowth.has(monthKey)) {
      const count = monthlyGrowth.get(monthKey) || 0
      monthlyGrowth.set(monthKey, count + 1)
    }
  })

  return Array.from(monthlyGrowth.entries())
    .map(([month, newMembers]) => ({
      month,
      newMembers,
      formattedMonth: new Date(month + "-01").toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      }),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}
