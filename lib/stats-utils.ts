import type { MemberStats, FacilityStats, Facility, GuestRecord } from "./types"
import { getAttendanceRecords, getMembers, getGuestRecords } from "./storage"

export const calculateMemberStats = (memberId: string, startDate?: Date, endDate?: Date): MemberStats | null => {
  const members = getMembers()
  const member = members.find((m) => m.id === memberId)

  if (!member) {
  console.log("Member not found:", memberId)
    return null
  }

  const attendanceRecords = getAttendanceRecords()
  console.log("Total attendance records:", attendanceRecords.length)
  console.log("All attendance records:", attendanceRecords)

  // Filter records by member and date range
  let memberRecords = attendanceRecords.filter((record) => record.memberId === memberId)
  console.log("Member records found:", memberRecords.length, memberRecords)

  if (startDate) {
    memberRecords = memberRecords.filter((record) => new Date(record.entryTime) >= startDate)
  }

  if (endDate) {
    memberRecords = memberRecords.filter((record) => new Date(record.entryTime) <= endDate)
  }

  console.log("Filtered member records:", memberRecords.length)

  // Calculate facility usage
  const facilityUsage = new Map<Facility, number>()
  let lastVisit: Date | undefined

  memberRecords.forEach((record) => {
    const count = facilityUsage.get(record.facility) || 0
    facilityUsage.set(record.facility, count + 1)

    if (!lastVisit || new Date(record.entryTime) > lastVisit) {
      lastVisit = new Date(record.entryTime)
    }
  })

  const totalVisits = memberRecords.length
  const facilitiesUsed: FacilityStats[] = Array.from(facilityUsage.entries()).map(([facility, visits]) => ({
    facility,
    visits,
    percentage: totalVisits > 0 ? Math.round((visits / totalVisits) * 100) : 0,
    lastVisit: memberRecords
      .filter((r) => r.facility === facility)
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())[0]?.entryTime,
  }))

  // Sort by most used
  facilitiesUsed.sort((a, b) => b.visits - a.visits)

  // Calculate current month and week visits
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentWeekStart = new Date(now)
  currentWeekStart.setDate(now.getDate() - now.getDay())

  const currentMonthVisits = memberRecords.filter((record) => new Date(record.entryTime) >= currentMonthStart).length

  const currentWeekVisits = memberRecords.filter((record) => new Date(record.entryTime) >= currentWeekStart).length

  return {
    memberId,
    totalVisits,
    facilitiesUsed,
    currentMonthVisits,
    currentWeekVisits,
  }
}

export const calculateGlobalStats = (startDate?: Date, endDate?: Date) => {
  const attendanceRecords = getAttendanceRecords()
  console.log("Calculating global stats with records:", attendanceRecords.length)

  let filteredRecords = attendanceRecords

  if (startDate) {
    filteredRecords = filteredRecords.filter((record) => new Date(record.entryTime) >= startDate)
  }

  if (endDate) {
    filteredRecords = filteredRecords.filter((record) => new Date(record.entryTime) <= endDate)
  }

  console.log("Filtered records for global stats:", filteredRecords.length)

  // Calculate facility usage
  const facilityUsage = new Map<string, number>()
  const memberVisits = new Map<string, number>()

  filteredRecords.forEach((record) => {
    // Facility usage
    const facilityCount = facilityUsage.get(record.facility) || 0
    facilityUsage.set(record.facility, facilityCount + 1)

    // Member visits
    const memberCount = memberVisits.get(record.memberId) || 0
    memberVisits.set(record.memberId, memberCount + 1)
  })

  const totalVisits = filteredRecords.length
  const facilitiesUsed = Array.from(facilityUsage.entries()).map(([facility, visits]) => ({
    facility,
    visits,
    percentage: totalVisits > 0 ? Math.round((visits / totalVisits) * 100) : 0,
    lastVisit: filteredRecords
      .filter((r) => r.facility === facility)
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())[0]?.entryTime,
  }))

  facilitiesUsed.sort((a, b) => b.visits - a.visits)

  // Calculate daily trend for last 30 days
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const dailyVisits = new Map<string, number>()

  // Initialize all days with 0
  for (let i = 0; i < 30; i++) {
    const date = new Date(last30Days.getTime() + i * 24 * 60 * 60 * 1000)
    const dateKey = date.toISOString().split("T")[0]
    dailyVisits.set(dateKey, 0)
  }

  // Count actual visits
  filteredRecords
    .filter((record) => new Date(record.entryTime) >= last30Days)
    .forEach((record) => {
      const dateKey = record.date
      const count = dailyVisits.get(dateKey) || 0
      dailyVisits.set(dateKey, count + 1)
    })

  const visitTrend = Array.from(dailyVisits.entries())
    .map(([date, visits]) => ({
      date,
      visits,
      formattedDate: new Date(date).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalVisits,
    facilitiesUsed,
    visitTrend,
    uniqueMembers: memberVisits.size,
  }
}

export const getDateRangePresets = () => {
  const now = new Date()

  return {
    thisWeek: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()),
      end: now,
      label: "Esta semana",
    },
    thisMonth: {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now,
      label: "Este mes",
    },
    last30Days: {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: now,
      label: "Últimos 30 días",
    },
    last3Months: {
      start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      end: now,
      label: "Últimos 3 meses",
    },
    thisYear: {
      start: new Date(now.getFullYear(), 0, 1),
      end: now,
      label: "Este año",
    },
  }
}

export const getMemberVisitTrend = (memberId: string, days = 30) => {
  const attendanceRecords = getAttendanceRecords()
  const memberRecords = attendanceRecords.filter((record) => record.memberId === memberId)

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
  memberRecords
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

export const getTodayStats = (memberId?: string) => {
  const attendanceRecords = getAttendanceRecords()
  const today = new Date().toISOString().split("T")[0]

  let todayRecords = attendanceRecords.filter((record) => record.date === today)

  if (memberId) {
    todayRecords = todayRecords.filter((record) => record.memberId === memberId)
  }

  const facilityUsage = new Map<string, number>()
  const companions = new Map<string, string[]>()

  todayRecords.forEach((record) => {
    const facilityCount = facilityUsage.get(record.facility) || 0
    facilityUsage.set(record.facility, facilityCount + 1)

    // Si el registro tiene acompañantes, los agregamos
    if (record.companions && record.companions.length > 0) {
      companions.set(record.id, record.companions)
    }
  })

  const facilitiesUsed = Array.from(facilityUsage.entries()).map(([facility, visits]) => ({
    facility,
    visits,
    percentage: todayRecords.length > 0 ? Math.round((visits / todayRecords.length) * 100) : 0,
  }))

  return {
    totalVisits: todayRecords.length,
    facilitiesUsed,
    companions: Array.from(companions.entries()),
    records: todayRecords,
  }
}

export const getCalendarData = (memberId: string, year: number, month: number) => {
  const attendanceRecords = getAttendanceRecords()
  const guestRecords = getGuestRecords()
  const memberRecords = attendanceRecords.filter((record) => record.memberId === memberId)

  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  const monthRecords = memberRecords.filter((record) => {
    const recordDate = new Date(record.date)
    return recordDate >= startDate && recordDate <= endDate
  })

  // Filter guest records for the same period and member
  const monthGuestRecords = guestRecords.filter((record: GuestRecord) => {
    const recordDate = new Date(record.date)
    return record.memberId === memberId && recordDate >= startDate && recordDate <= endDate
  })

  const dailyData = new Map<string, any>()

  // Process attendance records
  monthRecords.forEach((record) => {
    const dateKey = record.date
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, {
        attendanceRecords: [],
        guestRecords: []
      })
    }
    dailyData.get(dateKey)!.attendanceRecords.push(record)
  })

  // Process guest records
  monthGuestRecords.forEach((record: GuestRecord) => {
    const dateKey = record.date
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, {
        attendanceRecords: [],
        guestRecords: []
      })
    }
    dailyData.get(dateKey)!.guestRecords.push(record)
  })

  return Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    visits: data.attendanceRecords.length,
    facilities: [...new Set(data.attendanceRecords.map((r: any) => r.facility))],
    companions: data.attendanceRecords.flatMap((r: any) => r.companions || []),
    guests: data.guestRecords.map((g: any) => g.guestName),
    records: data.attendanceRecords,
    guestRecords: data.guestRecords,
  }))
}
