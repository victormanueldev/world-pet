/**
 * PhotoUpload — Drag-and-drop photo upload component for pet photos
 *
 * Handles file validation, preview, and upload progress with dark glassmorphism styling
 */
import { useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface PhotoUploadProps {
  value?: string | null; // Current photo URL
  onChange: (photoKey: string | null) => void;
  onUpload?: (file: File) => Promise<string>; // Upload handler, returns photo_key
  disabled?: boolean;
  maxSize?: number; // MB
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PhotoUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  maxSize = 5,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Please upload a JPEG, PNG, or WebP image';
      }
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload if handler provided
        if (onUpload) {
          const photoKey = await onUpload(file);
          onChange(photoKey);
        }

        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [validateFile, onUpload, onChange]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative group"
          >
            <div className="glass rounded-xl overflow-hidden border border-white/10">
              <img
                src={preview}
                alt="Pet preview"
                className="w-full h-64 object-cover"
              />
            </div>
            {!disabled && (
              <motion.button
                type="button"
                onClick={handleRemove}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-sm
                         text-white/90 hover:bg-black/80 hover:text-white transition-all"
              >
                <X size={16} />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={clsx(
              'glass rounded-xl border-2 border-dashed transition-all',
              isDragging
                ? 'border-brand bg-brand/5 scale-[1.02]'
                : 'border-white/10 hover:border-white/20',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <label
              className={clsx(
                'flex flex-col items-center justify-center h-64 cursor-pointer',
                disabled && 'cursor-not-allowed'
              )}
            >
              <input
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleChange}
                disabled={disabled || uploading}
                className="hidden"
              />

              {uploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-12 h-12 border-3 border-brand border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-text-secondary">
                    Uploading... {progress}%
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={!disabled ? { scale: 1.05 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="p-4 rounded-full glass border border-white/10">
                    {isDragging ? (
                      <Upload size={32} className="text-brand" />
                    ) : (
                      <ImageIcon size={32} className="text-text-secondary" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/90">
                      {isDragging ? 'Drop to upload' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      JPEG, PNG, or WebP (max {maxSize}MB)
                    </p>
                  </div>
                </motion.div>
              )}
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-status-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
