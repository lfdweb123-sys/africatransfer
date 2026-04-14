export type UserPlan = 'free' | 'premium'

export interface User {
  uid: string
  email: string
  displayName?: string
  plan: UserPlan
  planExpiresAt?: Date
  createdAt: Date
  storageUsed: number // bytes
  transferCount: number
}

export interface FileItem {
  id: string
  name: string
  size: number
  type: string
  url: string
  storagePath: string
}

export interface Transfer {
  id: string
  shareId: string           // Short unique link ID
  ownerId?: string          // null if anonymous
  ownerEmail?: string       // email of sender
  files: FileItem[]
  totalSize: number
  message?: string
  passwordHash?: string     // optional password protection
  expiresAt: Date           // 7 days free, 1 year premium
  createdAt: Date
  downloadCount: number
  maxDownloads?: number     // optional download limit
  plan: UserPlan
  status: 'active' | 'expired' | 'deleted'
  recipientEmails?: string[]
  senderName?: string
}

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  plan: UserPlan
  status: 'pending' | 'success' | 'failed'
  feexpayTransactionId?: string
  createdAt: Date
  paidAt?: Date
}

export interface PlanConfig {
  name: string
  maxFileSize: number       // bytes
  maxTransferSize: number   // bytes
  retentionDays: number
  maxDownloadsPerTransfer?: number
  passwordProtection: boolean
  customExpiry: boolean
  apiAccess: boolean
  chromeExtension: boolean
  price?: number            // FCFA
}

export const PLANS: Record<UserPlan, PlanConfig> = {
  free: {
    name: 'Gratuit',
    maxFileSize: 500 * 1024 * 1024,       // 500 MB par fichier
    maxTransferSize: 2 * 1024 * 1024 * 1024, // 2 GB total
    retentionDays: 7,
    passwordProtection: true,
    customExpiry: false,
    apiAccess: false,
    chromeExtension: false,
  },
  premium: {
    name: 'Premium',
    maxFileSize: 50 * 1024 * 1024 * 1024,   // 50 GB par fichier
    maxTransferSize: 200 * 1024 * 1024 * 1024, // 200 GB total
    retentionDays: 365,
    passwordProtection: true,
    customExpiry: true,
    apiAccess: true,
    chromeExtension: true,
    price: 3500, // FCFA/mois
  },
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 o'
  const k = 1024
  const sizes = ['o', 'Ko', 'Mo', 'Go', 'To']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'music'
  if (type === 'application/pdf') return 'file-text'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'archive'
  if (type.includes('word') || type.includes('document')) return 'file-text'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'table'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'presentation'
  return 'file'
}
