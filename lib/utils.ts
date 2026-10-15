import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskName(fullName: string): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]

  const firstName = parts.slice(0, -1).join(' ')
  const lastName = parts[parts.length - 1]

  const maskedLast = lastName.length > 1
    ? lastName[0] + '*'.repeat(Math.min(lastName.length - 1, 4))
    : lastName + '*'

  return `${firstName} ${maskedLast}`
}