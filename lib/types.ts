export interface Member {
  id: string
  membershipNumber: string
  firstName: string
  lastName: string
  phone: string
  email: string
  emergencyContactName: string
  emergencyContactPhone: string
  hasInsurance: boolean
  insuranceCompany?: string
  policyNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface AttendanceRecord {
  id: string
  memberId: string
  membershipNumber: string
  memberName?: string
  facility: Facility
  entryTime: Date
  date: string // YYYY-MM-DD format
  companions?: string[]
}

export interface GuestRecord {
  id: string
  memberId: string
  membershipNumber: string
  guestName: string
  entryTime: Date
  date: string // YYYY-MM-DD format
  additionalCharge: number
}

export interface AdditionalCharge {
  id: string
  memberId: string
  membershipNumber: string
  amount: number
  reason: string
  date: string
  paid: boolean
}

export type Facility =
  | "Gimnasio"
  | "Piscina"
  | "Cancha de baloncesto"
  | "Cancha de tenis"
  | "Cafetería"
  | "Sauna"
  | "Área de spinning"
  | "Puerta Principal"

export interface FacilityStats {
  facility: Facility
  visits: number
  percentage: number
  lastVisit?: Date
}

export interface MemberStats {
  memberId: string
  totalVisits: number
  facilitiesUsed: FacilityStats[]
  currentMonthVisits: number
  currentWeekVisits: number
}

export interface DashboardStats {
  totalMembers: number
  todayVisits: number
  monthlyVisits: number
  popularFacilities: FacilityStats[]
  revenueFromGuests: number
  activeMembers: number
}
