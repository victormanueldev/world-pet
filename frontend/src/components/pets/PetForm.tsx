/**
 * PetForm — Comprehensive form for creating/editing pets
 *
 * Supports both owner and admin modes with conditional owner selection
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Pet, PetCreate, PetUpdate, PetSpecies, PetSex, PetStatus } from '@/types/pet';
import { PhotoUpload } from './PhotoUpload';
import { Button } from '@/components/ui/Button';
import { uploadPetPhoto } from '@/services/pets';

interface PetFormProps {
  initialData?: Pet | null;
  onSubmit: (data: PetCreate | PetUpdate) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  isAdmin?: boolean;
  loading?: boolean;
}

const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'other', label: 'Other' },
];

const SEX_OPTIONS: { value: PetSex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
];

const STATUS_OPTIONS: { value: PetStatus; label: string }[] = [
  { value: 'available_for_adoption', label: 'Available for Adoption' },
  { value: 'owned', label: 'Owned' },
  { value: 'inactive', label: 'Inactive' },
];

export function PetForm({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
  isAdmin = false,
  loading = false,
}: PetFormProps) {
  const [formData, setFormData] = useState<Partial<PetCreate>>({
    name: initialData?.name || '',
    species: initialData?.species || 'dog',
    breed: initialData?.breed || '',
    sex: initialData?.sex || 'male',
    birth_date: initialData?.birth_date || '',
    weight: initialData?.weight || undefined,
    sterilized: initialData?.sterilized || false,
    photo_key: initialData?.photo_key || null,
    owner_id: initialData?.owner_id || undefined,
    status: initialData?.status || 'owned',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.species) {
      newErrors.species = 'Species is required';
    }

    if (!formData.sex) {
      newErrors.sex = 'Sex is required';
    }

    if (formData.weight && formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    if (formData.weight && formData.weight > 999.99) {
      newErrors.weight = 'Weight must be less than 1000 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData as PetCreate);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const photoKey = await uploadPetPhoto(file);
      return photoKey;
    } finally {
      setUploading(false);
    }
  };

  const inputClasses = clsx(
    'w-full h-10 px-4 rounded-lg',
    'glass border border-white/10',
    'text-white placeholder:text-text-secondary',
    'focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );

  const labelClasses = 'block text-sm font-medium text-white/90 mb-2';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div>
        <label className={labelClasses}>Photo</label>
        <PhotoUpload
          value={formData.photo_key}
          onChange={(photoKey) => setFormData({ ...formData, photo_key: photoKey })}
          onUpload={handlePhotoUpload}
          disabled={loading || uploading}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className={labelClasses}>
          Name <span className="text-status-error">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClasses}
          placeholder="Enter pet name"
          disabled={loading}
          required
        />
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-status-error"
          >
            {errors.name}
          </motion.p>
        )}
      </div>

      {/* Species and Sex - Side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="species" className={labelClasses}>
            Species <span className="text-status-error">*</span>
          </label>
          <select
            id="species"
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value as PetSpecies })}
            className={inputClasses}
            disabled={loading}
            required
          >
            {SPECIES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sex" className={labelClasses}>
            Sex <span className="text-status-error">*</span>
          </label>
          <select
            id="sex"
            value={formData.sex}
            onChange={(e) => setFormData({ ...formData, sex: e.target.value as PetSex })}
            className={inputClasses}
            disabled={loading}
            required
          >
            {SEX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Breed */}
      <div>
        <label htmlFor="breed" className={labelClasses}>
          Breed
        </label>
        <input
          id="breed"
          type="text"
          value={formData.breed || ''}
          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          className={inputClasses}
          placeholder="e.g., Golden Retriever"
          disabled={loading}
        />
      </div>

      {/* Birth Date and Weight - Side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birth_date" className={labelClasses}>
            Birth Date
          </label>
          <input
            id="birth_date"
            type="date"
            value={formData.birth_date || ''}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            className={inputClasses}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="weight" className={labelClasses}>
            Weight (kg)
          </label>
          <input
            id="weight"
            type="number"
            step="0.01"
            min="0"
            max="999.99"
            value={formData.weight || ''}
            onChange={(e) =>
              setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })
            }
            className={inputClasses}
            placeholder="25.5"
            disabled={loading}
          />
          {errors.weight && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-status-error"
            >
              {errors.weight}
            </motion.p>
          )}
        </div>
      </div>

      {/* Sterilized Checkbox */}
      <div className="flex items-center gap-3">
        <input
          id="sterilized"
          type="checkbox"
          checked={formData.sterilized}
          onChange={(e) => setFormData({ ...formData, sterilized: e.target.checked })}
          className="w-5 h-5 rounded border-white/10 glass text-brand focus:ring-brand/50"
          disabled={loading}
        />
        <label htmlFor="sterilized" className="text-sm font-medium text-white/90 cursor-pointer">
          Sterilized
        </label>
      </div>

      {/* Admin-only fields */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-4 border-t border-white/10"
        >
          <h3 className="text-sm font-semibold text-white/90">Admin Settings</h3>

          <div>
            <label htmlFor="status" className={labelClasses}>
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PetStatus })}
              className={inputClasses}
              disabled={loading}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Owner ID - In production, this should be a user dropdown */}
          <div>
            <label htmlFor="owner_id" className={labelClasses}>
              Owner ID (optional for adoption workflow)
            </label>
            <input
              id="owner_id"
              type="number"
              value={formData.owner_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, owner_id: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className={inputClasses}
              placeholder="Leave empty for clinic-owned pets"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-text-secondary">
              Leave empty to create a clinic-owned pet available for adoption
            </p>
          </div>
        </motion.div>
      )}

      {/* Form Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" variant="primary" size="lg" loading={loading || uploading} className="flex-1">
          {mode === 'create' ? 'Create Pet' : 'Save Changes'}
        </Button>

        {onCancel && (
          <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={loading || uploading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
