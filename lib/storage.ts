import type { Member, AttendanceRecord, GuestRecord, AdditionalCharge, Facility } from "./types"

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
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
    return stored
      ? JSON.parse(stored).map((record: any) => ({
        ...record,
        entryTime: new Date(record.entryTime),
        exitTime: record.exitTime ? new Date(record.exitTime) : undefined,
      }))
      : []
  } catch (error) {
    console.error("Error parsing attendance records:", error)
    return []
  }
}

export const saveAttendanceRecord = (record: AttendanceRecord): { type: 'entry' | 'exit', record: AttendanceRecord } => {
  const records = getAttendanceRecords()
  const today = record.date
  
  // Buscar si el usuario ya tiene una entrada activa (sin salida correspondiente) en la misma facilidad el mismo día
  const hasActiveEntry = records.some(r => 
    r.memberId === record.memberId && 
    r.facility === record.facility && 
    r.date === today && 
    r.type === 'entry' &&
    !records.some(exitRecord => 
      exitRecord.memberId === record.memberId &&
      exitRecord.facility === record.facility &&
      exitRecord.date === today &&
      exitRecord.type === 'exit' &&
      new Date(exitRecord.entryTime) > new Date(r.entryTime)
    )
  )
  
  let recordToSave: AttendanceRecord
  let actionType: 'entry' | 'exit'
  
  if (hasActiveEntry) {
    // Ya existe una entrada activa, crear un nuevo registro de salida
    recordToSave = {
      id: crypto.randomUUID(),
      memberId: record.memberId,
      membershipNumber: record.membershipNumber,
      memberName: record.memberName,
      facility: record.facility,
      entryTime: record.entryTime instanceof Date ? record.entryTime : new Date(record.entryTime),
      date: record.date,
      type: 'exit',
      companions: record.companions
    }
    actionType = 'exit'
  } else {
    // No hay entrada activa, crear un nuevo registro de entrada
    recordToSave = {
      ...record,
      entryTime: record.entryTime instanceof Date ? record.entryTime : new Date(record.entryTime),
      type: 'entry',
      exitTime: undefined
    }
    actionType = 'entry'
  }
  
  // Agregar el nuevo registro a la lista
  records.push(recordToSave)
  
  // Guardar en localStorage
  const recordsToStore = records.map(r => ({
    ...r,
    entryTime: r.entryTime instanceof Date ? r.entryTime.toISOString() : r.entryTime,
    exitTime: r.exitTime && r.exitTime instanceof Date ? r.exitTime.toISOString() : r.exitTime,
  }))
  
  console.log("Saving attendance record to localStorage:", recordToSave)
  console.log("Action type:", actionType)
  console.log("Total records after save:", records.length)
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(recordsToStore))
  
  return { type: actionType, record: recordToSave }
}

// Function to check if a member is currently inside a facility
export const getMemberCurrentStatus = (memberId: string, facility: Facility): 'inside' | 'outside' => {
  const records = getAttendanceRecords()
  const today = new Date().toISOString().split("T")[0]
  
  // Obtener todos los registros del miembro en esa facilidad hoy, ordenados por tiempo
  const memberFacilityRecords = records
    .filter(r => 
      r.memberId === memberId && 
      r.facility === facility && 
      r.date === today
    )
    .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
  
  if (memberFacilityRecords.length === 0) {
    return 'outside'
  }
  
  // El último registro determina el estado actual
  const latestRecord = memberFacilityRecords[memberFacilityRecords.length - 1]
  return latestRecord.type === 'entry' ? 'inside' : 'outside'
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
