// src/components/PackageImages.tsx

import React from 'react';
import { ImageIcon, ChevronDown, ChevronUp, X, Upload, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface PackageImagesProps {
  formData: any;
  toggleSection: (section: 'images') => void;
  expandedSections: { images: boolean };
  handleImageUpload: (base64String: string) => void;
  handleRemoveImage: (index: number) => void;
}

const PackageImages: React.FC<PackageImagesProps> = ({
  formData,
  toggleSection,
  expandedSections,
  handleImageUpload,
  handleRemoveImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Array.from(event.target.files).forEach(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image.`);
          return;
        }

        // Check file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Image ${file.name} is larger than 5MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          if (loadEvent.target?.result) {
            handleImageUpload(loadEvent.target.result as string);
          }
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast.error(`Error reading file ${file.name}.`);
        };
        reader.readAsDataURL(file);
      });
    }
    // Clear the input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="card-modern p-6">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => toggleSection('images')}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-pink-600" />
          Package Images ({formData.images.length})
        </h3>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          {expandedSections.images ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      {expandedSections.images && (
        <div className="space-y-4">
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {formData.images.map((image: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Package ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/png, image/jpeg, image/webp"
            multiple
          />

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-pink-400 hover:text-pink-600 transition-colors font-medium flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Image</span>
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Upload images to showcase your package (Max 5MB each).
          </p>
        </div>
      )}
    </div>
  );
};

export default PackageImages;