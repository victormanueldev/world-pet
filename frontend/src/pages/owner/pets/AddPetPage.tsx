/**
 * AddPetPage — Create a new pet (Owner)
 *
 * Form for pet owners to add their own pets
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { PetForm } from '@/components/pets/PetForm';
import { createPet } from '@/services/pets';
import { extractApiError } from '@/services/api';
import { useTenant } from '@/context/TenantContext';
import type { PetCreate } from '@/types/pet';

export function AddPetPage() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: PetCreate) => {
    try {
      setLoading(true);
      setError(null);

      const newPet = await createPet(data);

      setSuccess(true);

      // Navigate to pet detail after successful creation
      setTimeout(() => {
        navigate(`/${currentTenant?.slug}/owner/pets/${newPet.id}`);
      }, 1000);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${currentTenant?.slug}/owner/pets`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Add Pet" subtitle="Create a new pet profile">
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
          <p className="text-status-error text-sm font-medium">Failed to create pet</p>
          <p className="text-status-error/80 text-sm mt-1">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-green-500/30 bg-green-500/10 p-4"
        >
          <p className="text-green-400 text-sm font-medium">Pet created successfully!</p>
          <p className="text-green-400/80 text-sm mt-1">Redirecting to pet details...</p>
        </motion.div>
      )}

      <div className="glass rounded-xl border border-white/10 p-6">
        <PetForm onSubmit={handleSubmit} onCancel={handleCancel} mode="create" loading={loading} isAdmin={false} />
      </div>
    </div>
  );
}
