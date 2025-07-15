'use client';

import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 6,
}: ImageUploadProps) {
  const [images, setImages] = React.useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const readers = Array.from(files).map(file => {
      return new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(uploadedUrls => {
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);
    });
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Images ({images.length}/{maxImages})
        </label>
        <p className='text-sm text-gray-500 mb-4'>
          Upload up to {maxImages} images of your game. First image will be the
          main photo.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          false
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${false ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileChange}
          className='hidden'
        />
        <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
        {false ? (
          <p className='text-sm text-gray-600'>Processing images...</p>
        ) : (
          <div>
            <p className='text-sm text-gray-600'>
              Drag & drop images here, or click to select
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              PNG, JPG, WEBP up to 4MB each
            </p>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {images.map((img, i) => (
            <div key={`${img}-${i}`} className='relative group'>
              <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                <img
                  src={img}
                  alt={`Game image ${i + 1}`}
                  className='w-full h-full object-cover'
                />
              </div>
              <button
                onClick={() => removeImage(i)}
                className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <X className='h-4 w-4' />
              </button>
              {i === 0 && (
                <div className='absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded'>
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      <div className='bg-blue-50 rounded-lg p-4'>
        <h4 className='text-sm font-medium text-blue-900 mb-2'>
          Tips for great photos:
        </h4>
        <ul className='text-xs text-blue-800 space-y-1'>
          <li>• Take photos in good lighting</li>
          <li>• Show the game box and components clearly</li>
          <li>• Include photos of any damage or wear</li>
          <li>• Make sure all pieces are visible</li>
        </ul>
      </div>

      {/* Note about current implementation */}
      <div className='bg-yellow-50 rounded-lg p-4'>
        <p className='text-xs text-yellow-800'>
          <strong>Note:</strong> Images are currently stored as data URLs. In
          production, these would be uploaded to a cloud storage service like
          Cloudflare R2.
        </p>
      </div>
    </div>
  );
}
