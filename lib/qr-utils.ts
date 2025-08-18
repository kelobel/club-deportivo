export const generateQRData = (membershipNumber: string): string => {
  return `CLUB_MEMBER_${membershipNumber}`
}

export const parseQRData = (qrData: string): string | null => {
  if (qrData.startsWith("CLUB_MEMBER_")) {
    return qrData.replace("CLUB_MEMBER_", "")
  }
  return null
}

export const generateQRCodeURL = (membershipNumber: string): string => {
  const qrData = generateQRData(membershipNumber)
  // Using a QR code API service - you can replace with your preferred service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
}
