import { supabase } from './db'

export interface UploadedImage {
  url: string
  path: string
  size: number
}

export class ImageUploadService {
  private bucketName = 'listing-images'
  private maxFileSize = 5 * 1024 * 1024 // 5MB
  private allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  // Initialize bucket if it doesn't exist
  async initializeBucket(): Promise<void> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName)
      
      if (!bucketExists) {
        await supabase.storage.createBucket(this.bucketName, {
          public: true,
          fileSizeLimit: this.maxFileSize,
          allowedMimeTypes: this.allowedTypes
        })
      }
    } catch (error) {
      console.error('Failed to initialize bucket:', error)
    }
  }

  // Upload a single image
  async uploadImage(file: File, listingId: string): Promise<UploadedImage> {
    // Validate file
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
    }

    if (file.size > this.maxFileSize) {
      throw new Error('File too large. Maximum size is 5MB.')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${listingId}/${timestamp}-${randomId}.${extension}`
    const filePath = `${this.bucketName}/${fileName}`

    try {
      // Upload file
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName)

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: file.size
      }
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  // Upload multiple images
  async uploadImages(files: File[], listingId: string): Promise<UploadedImage[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, listingId))
    return Promise.all(uploadPromises)
  }

  // Delete an image
  async deleteImage(imagePath: string): Promise<void> {
    try {
      const fileName = imagePath.split('/').pop()
      if (!fileName) throw new Error('Invalid image path')

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Image deletion error:', error)
      throw error
    }
  }

  // Delete multiple images
  async deleteImages(imagePaths: string[]): Promise<void> {
    const deletePromises = imagePaths.map(path => this.deleteImage(path))
    await Promise.all(deletePromises)
  }

  // Optimize image for web (client-side)
  async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(optimizedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
    }

    if (file.size > this.maxFileSize) {
      return { valid: false, error: 'File too large. Maximum size is 5MB.' }
    }

    return { valid: true }
  }
}

export const imageUploadService = new ImageUploadService() 