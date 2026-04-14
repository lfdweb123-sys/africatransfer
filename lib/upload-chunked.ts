// lib/upload-chunked.ts
const CHUNK_SIZE = 512 * 1024 // 512KB chunks (pour Vercel)

interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export async function uploadFileChunked(
  file: File,
  transferId: string,
  fileIndex: number,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const uploadId = `${transferId}-${file.name}-${Date.now()}-${Math.random()}`
  
  console.log(`Uploading ${file.name}: ${totalChunks} chunks of ${CHUNK_SIZE} bytes`)
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)
    
    const formData = new FormData()
    formData.append('uploadId', uploadId)
    formData.append('chunkIndex', String(i))
    formData.append('totalChunks', String(totalChunks))
    formData.append('fileName', file.name)
    formData.append('fileType', file.type)
    formData.append('fileSize', String(file.size))
    formData.append('transferId', transferId)
    formData.append('fileIndex', String(fileIndex))
    formData.append('chunk', chunk)
    
    try {
      const response = await fetch('/api/uploads/chunk', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `Chunk ${i} failed`)
      }
      
      // Mettre à jour la progression
      const progress = ((i + 1) / totalChunks) * 100
      onProgress?.(progress)
      
      console.log(`Chunk ${i + 1}/${totalChunks} uploaded for ${file.name}`)
      
    } catch (error) {
      console.error(`Failed to upload chunk ${i} for ${file.name}:`, error)
      return { success: false, error: `Échec du chunk ${i + 1}/${totalChunks}` }
    }
  }
  
  console.log(`All chunks uploaded for ${file.name}`)
  return { success: true }
}