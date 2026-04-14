import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  fileUploader: f({
    image: { maxFileSize: "512MB", maxFileCount: 20 },
    video: { maxFileSize: "512MB", maxFileCount: 10 },
    audio: { maxFileSize: "512MB", maxFileCount: 10 },
    pdf: { maxFileSize: "512MB", maxFileCount: 10 },
    text: { maxFileSize: "512MB", maxFileCount: 10 },
    blob: { maxFileSize: "512MB", maxFileCount: 20 },
  })
  .onUploadComplete(async ({ file }) => {
    return { url: file.url, name: file.name, size: file.size }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter