import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, Image, Video, Music, FileText, Archive, Plus } from 'lucide-react'
import { formatBytes, getFileIcon } from '../lib/types'

interface UploadZoneProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxSize: number // bytes
  maxTotal: number // bytes
}

function FileIcon({ type }: { type: string }) {
  const iconType = getFileIcon(type)
  const props = { size: 18, strokeWidth: 1.5 }

  switch (iconType) {
    case 'image': return <Image {...props} style={{ color: '#C9972A' }} />
    case 'video': return <Video {...props} style={{ color: '#8B5CF6' }} />
    case 'music': return <Music {...props} style={{ color: '#10B981' }} />
    case 'file-text': return <FileText {...props} style={{ color: '#3B82F6' }} />
    case 'archive': return <Archive {...props} style={{ color: '#F59E0B' }} />
    default: return <File {...props} className="text-gray-400" />
  }
}

export default function UploadZone({ files, onFilesChange, maxSize, maxTotal }: UploadZoneProps) {
  const [errors, setErrors] = useState<string[]>([])

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    const newErrors: string[] = []

    if (rejected.length > 0) {
      rejected.forEach(({ file, errors: fileErrors }) => {
        fileErrors.forEach((e: any) => {
          if (e.code === 'file-too-large') {
            newErrors.push(`"${file.name}" dépasse la limite de ${formatBytes(maxSize)}`)
          } else {
            newErrors.push(`"${file.name}" : ${e.message}`)
          }
        })
      })
    }

    if (accepted.length > 0) {
      // Check total size
      const newTotal = totalSize + accepted.reduce((acc, f) => acc + f.size, 0)
      if (newTotal > maxTotal) {
        newErrors.push(`Taille totale dépassée. Maximum : ${formatBytes(maxTotal)}`)
      } else {
        // Deduplicate by name
        const existing = new Set(files.map(f => f.name))
        const unique = accepted.filter(f => !existing.has(f.name))
        if (unique.length < accepted.length) {
          newErrors.push('Certains fichiers étaient déjà ajoutés.')
        }
        onFilesChange([...files, ...unique])
      }
    }

    setErrors(newErrors)
    if (newErrors.length > 0) {
      setTimeout(() => setErrors([]), 5000)
    }
  }, [files, maxSize, maxTotal, totalSize, onFilesChange])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxSize,
    noClick: files.length > 0,
    noKeyboard: files.length > 0,
  })

  function removeFile(index: number) {
    const updated = [...files]
    updated.splice(index, 1)
    onFilesChange(updated)
  }

  const progress = maxTotal > 0 ? (totalSize / maxTotal) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`upload-zone rounded-2xl transition-all ${
          files.length === 0
            ? 'p-12 cursor-pointer text-center'
            : 'p-6 cursor-default'
        } ${isDragActive ? 'dragover' : ''}`}
      >
        <input {...getInputProps()} />

        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
              <Upload size={28} className={isDragActive ? 'text-yellow-600' : 'text-gray-400'} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-gray-900 font-medium mb-1">
                {isDragActive ? 'Déposez vos fichiers ici' : 'Glissez vos fichiers ici'}
              </p>
              <p className="text-sm text-gray-400">
                ou <span className="text-yellow-600 font-medium cursor-pointer hover:underline">parcourez votre appareil</span>
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Tous formats acceptés · Max {formatBytes(maxSize)} par fichier · {formatBytes(maxTotal)} au total
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="file-item group animate-slide-up">
                <FileIcon type={file.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Add more */}
            <button
              onClick={open}
              className="file-item w-full cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all"
            >
              <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Plus size={14} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">Ajouter d'autres fichiers</p>
            </button>
          </div>
        )}
      </div>

      {/* Size indicator */}
      {files.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}</span>
            <span>{formatBytes(totalSize)} / {formatBytes(maxTotal)}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: progress > 80 ? '#EF4444' : 'linear-gradient(90deg, #C9972A, #E4B84A)',
              }}
            />
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.map((err, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          <X size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{err}</p>
        </div>
      ))}
    </div>
  )
}
