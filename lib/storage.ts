import type { Member, AttendanceRecord, GuestRecord, AdditionalCharge } from "./types"

const STORAGE_KEYS = {
  MEMBERS: "club_members",
  ATTENDANCE: "club_attendance",
  GUESTS: "club_guests",
  CHARGES: "club_charges",
} as const

// Member management
export const getMembers = (): Member[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
  return stored ? JSON.parse(stored) : []
}

export const saveMember = (member: Member): void => {
  const members = getMembers()
  const existingIndex = members.findIndex((m) => m.id === member.id)

  if (existingIndex >= 0) {
    members[existingIndex] = { ...member, updatedAt: new Date() }
  } else {
    members.push(member)
  }

  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))
}

export const deleteMember = (memberId: string): void => {
  const members = getMembers().filter((m) => m.id !== memberId)
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))

  // Eliminar todos los registros de asistencia del miembro
  const attendanceRecords = getAttendanceRecords().filter((record) => record.memberId !== memberId)
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords))

  // Eliminar todos los registros de invitados del miembro
  const guestRecords = getGuestRecords().filter((record) => record.memberId !== memberId)
  localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guestRecords))

  // Eliminar todos los cargos adicionales del miembro
  const additionalCharges = getAdditionalCharges().filter((charge) => charge.memberId !== memberId)
  localStorage.setItem(STORAGE_KEYS.CHARGES, JSON.stringify(additionalCharges))
}

export const generateMembershipNumber = (): string => {
  const members = getMembers()
  const existingNumbers = members.map((m) => Number.parseInt(m.membershipNumber))
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
  return (maxNumber + 1).toString().padStart(6, "0")
}

// Attendance management
export const getAttendanceRecords = (): AttendanceRecord[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
  return stored
    ? JSON.parse(stored).map((record: any) => ({
        ...record,
        entryTime: new Date(record.entryTime),
      }))
    : []
}

export const saveAttendanceRecord = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords()
  // Asegurar que entryTime sea una fecha válida antes de guardar
  const recordToSave = {
    ...record,
    entryTime: record.entryTime instanceof Date ? record.entryTime.toISOString() : record.entryTime,
  }
  records.push(recordToSave)
  console.log("Saving attendance record to localStorage:", recordToSave)
  console.log("Total records after save:", records.length)
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records))
}

// Guest management
export const getGuestRecords = (): GuestRecord[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.GUESTS)
  return stored
    ? JSON.parse(stored).map((record: any) => ({
        ...record,
        entryTime: new Date(record.entryTime),
      }))
    : []
}

export const saveGuestRecord = (record: GuestRecord): void => {
  const records = getGuestRecords()
  records.push(record)
  localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(records))
}

export const getTodayGuestCount = (memberId: string): number => {
  const today = new Date().toISOString().split("T")[0]
  return getGuestRecords().filter((record) => record.memberId === memberId && record.date === today).length
}

// Additional charges management
export const getAdditionalCharges = (): AdditionalCharge[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.CHARGES)
  return stored ? JSON.parse(stored) : []
}

export const saveAdditionalCharge = (charge: AdditionalCharge): void => {
  const charges = getAdditionalCharges()
  charges.push(charge)
  localStorage.setItem(STORAGE_KEYS.CHARGES, JSON.stringify(charges))
}

// Utility functions
export const findMemberByMembershipNumber = (membershipNumber: string): Member | null => {
  return getMembers().find((m) => m.membershipNumber === membershipNumber) || null
}

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic validation for local phone numbers (adjust regex as needed)
  const phoneRegex = /^[\d\s\-+$$$$]{8,15}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
