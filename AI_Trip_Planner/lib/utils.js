import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount === undefined || amount === null) return ''
  const num = Number(amount)
  if (isNaN(num)) return amount

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  if (currency === 'EUR') {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  if (currency === 'GBP') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(num)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

export function getCurrencySymbol(currency = 'USD') {
  switch (currency) {
    case 'INR': return '₹'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'JPY': return '¥'
    default: return '$'
  }
}
