// utils/isbn.js
export function formatISBN(value) {
    const cleanValue = (value || "").replace(/[^0-9Xx]/g, "").toUpperCase()
  
    if (cleanValue.length >= 3 && (cleanValue.startsWith("978") || cleanValue.startsWith("979"))) {
      let formatted = cleanValue.substring(0, 3)
      if (cleanValue.length > 3) formatted += "-" + cleanValue.substring(3, 4)
      if (cleanValue.length > 4) formatted += "-" + cleanValue.substring(4, 7)
      if (cleanValue.length > 7) formatted += "-" + cleanValue.substring(7, 12)
      if (cleanValue.length > 12) formatted += "-" + cleanValue.substring(12, 13)
      return formatted
    }
  
    if (cleanValue.length <= 10) {
      let formatted = cleanValue.substring(0, 1)
      if (cleanValue.length > 1) formatted += "-" + cleanValue.substring(1, 3)
      if (cleanValue.length > 3) formatted += "-" + cleanValue.substring(3, 9)
      if (cleanValue.length > 9) formatted += "-" + cleanValue.substring(9, 10)
      return formatted
    }
  
    return cleanValue
  }
  