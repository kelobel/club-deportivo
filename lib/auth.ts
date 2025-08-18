export interface User {
  id: string
  firstName: string
  memberCode?: string
  isAdmin: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Simple auth storage using localStorage
export const authStorage = {
  getUser: (): User | null => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem("club-auth-user")
    return stored ? JSON.parse(stored) : null
  },

  setUser: (user: User) => {
    if (typeof window === "undefined") return
    localStorage.setItem("club-auth-user", JSON.stringify(user))
  },

  removeUser: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("club-auth-user")
  },
}

// Auth functions
export const loginUser = (firstName: string, memberCode: string): User | null => {
  console.log("Attempting login with:", { firstName, memberCode })

  // Get members from storage to validate login
  const members = JSON.parse(localStorage.getItem("club_members") || "[]")
  console.log(
  "Available members:",
    members.map((m: any) => ({ firstName: m.firstName, membershipNumber: m.membershipNumber })),
  )

  // Find member by first name and membership number
  const member = members.find(
    (m: any) => m.firstName.toLowerCase() === firstName.toLowerCase() && m.membershipNumber === memberCode,
  )

  console.log("Found member:", member)

  if (member) {
    const user: User = {
      id: member.id,
      firstName: member.firstName,
      memberCode: member.membershipNumber,
      isAdmin: false,
    }
    authStorage.setUser(user)
    return user
  }

  return null
}

export const loginAdmin = (): User => {
  const user: User = {
    id: "admin",
    firstName: "Administrador",
    isAdmin: true,
  }
  authStorage.setUser(user)
  return user
}

export const logout = () => {
  authStorage.removeUser()
}

export const getCurrentUser = (): User | null => {
  return authStorage.getUser()
}
