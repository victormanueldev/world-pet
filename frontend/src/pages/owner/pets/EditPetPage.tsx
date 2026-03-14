/**
 * EditPetPage — Edit an existing pet (Owner)
 *
 * Form for pet owners to update their pet's information
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { PetForm } from '@/components/pets/PetForm';
import { getPet, updatePet } from '@/services/pets';
import { extractApiError } from '@/services/api';
import { useTenant } from '@/context/TenantContext';
import type { Pet, PetUpdate } from '@/types/pet';

export function EditPetPage() {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const { currentTenant } = useTenant();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (petId) {
      loadPet(parseInt(petId));
    }
  }, [petId]);

  const loadPet = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPet(id);
      setPet(data);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PetUpdate) => {
    if (!petId) return;

    try {
      setSaving(true);
      setError(null);

      const updatedPet = await updatePet(parseInt(petId), data);
      setPet(updatedPet);
      setSuccess(true);

      // Navigate back to pet detail after successful update
      setTimeout(() => {
        navigate(`/${currentTenant?.slug}/owner/pets/${petId}`);
      }, 1000);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${currentTenant?.slug}/owner/pets/${petId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader title="Edit Pet" subtitle="Loading..." />
        <div className="glass rounded-xl border border-white/10 p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-64 bg-white/5 rounded-lg" />
            <div className="h-10 bg-white/5 rounded-lg" />
            <div className="h-10 bg-white/5 rounded-lg" />
            <div className="h-10 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader title="Edit Pet" subtitle="Pet not found">
          <Button variant="ghost" size="md" leftIcon={<ArrowLeft size={20} />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </PageHeader>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-status-error/30 bg-status-error/10 p-6 text-center"
        >
          <p className="text-status-error text-sm font-medium mb-2">Failed to load pet</p>
          <p className="text-status-error/80 text-sm">{error}</p>
          <Button variant="secondary" size="md" onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title={`Edit ${pet?.name}`} subtitle="Update your pet's information">
        <Button variant="ghost" size="md" leftIcon={<ArrowLeft size={20} />} onClick={handleCancel}>
          Back
        </Button>
      </PageHeader>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-status-error/30 bg-status-error/10 p-4"
        >
          <p className="text-status-error text-sm font-medium">Failed to update pet</p>
          <p className="text-status-error/80 text-sm mt-1">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-green-500/30 bg-green-500/10 p-4"
        >
          <p className="text-green-400 text-sm font-medium">Pet updated successfully!</p>
          <p className="text-green-400/80 text-sm mt-1">Redirecting to pet details...</p>
        </motion.div>
      )}

      <div className="glass rounded-xl border border-white/10 p-6">
        <PetForm
          initialData={pet}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          mode="edit"
          loading={saving}
          isAdmin={false}
        />
      </div>
    </div>
  );
}
