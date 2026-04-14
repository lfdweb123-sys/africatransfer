// This file ensures nanoid compatibility
// We use uuid v4 for IDs in the project
// nanoid is only used for short share IDs in transfers/create.ts

export function nanoid(size = 21): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < size; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
