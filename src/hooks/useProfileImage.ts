// src/hooks/useProfileImage.ts
import { useState, useRef } from 'react'
import { useUser } from './useUser'

export const useProfileImage = () => {
  const { updateUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageClick = () => fileInputRef.current?.click()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    setUploadingImage(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      updateUser({ profilePic: reader.result as string })
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  return {
    fileInputRef,
    uploadingImage,
    handleImageClick,
    handleImageUpload,
  }
}
