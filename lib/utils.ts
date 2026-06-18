import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shareOnWhatsApp(phone: string, message: string): void {
  const cleaned = phone.replace(/\D/g, "").replace(/^0/, "234")
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank", "noopener,noreferrer")
}

export function getTransactionReceiptMessage(
  type: string,
  amount: number,
  recipient: string,
  ref: string,
  date: string,
): string {
  return [
    `*Korapay Receipt*`,
    ``,
    `Transaction: ${type.toUpperCase()}`,
    `Amount: ₦${amount.toLocaleString()}`,
    `Recipient: ${recipient}`,
    `Reference: ${ref}`,
    `Date: ${date}`,
    `Status: Successful ✅`,
    ``,
    `Thank you for using Korapay!`,
    `Powered by 9PSB`,
  ].join("\n")
}
